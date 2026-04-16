import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { adminUpdateSchema } from "@/lib/schemas/reservation";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import {
  buildUserConfirmedEmail,
  buildUserRejectedEmail,
} from "@/lib/email-templates";
import { SITE } from "@/constants/site";
import type { ReservationStatus } from "@/types";

// 허용되는 상태 전이 규칙
const VALID_TRANSITIONS: Record<string, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
};

type UpdatedReservation = {
  id: string;
  reservation_no: string;
  status: ReservationStatus;
  reject_reason: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  preferred_date: string;
  preferred_time: string;
  attorney: { name: string } | null;
};

/**
 * PATCH /api/reservations/[id] — 관리자 예약 상태 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const parsed = adminUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status: newStatus, reject_reason } = parsed.data;

    const supabase = await createClient();

    // 1. 관리자 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 2. 예약 조회
    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, status")
      .eq("id", id)
      .single();

    if (findError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 3. 상태 전이 규칙 검증
    const allowed = VALID_TRANSITIONS[reservation.status];
    if (!allowed || !allowed.includes(newStatus as ReservationStatus)) {
      return NextResponse.json(
        {
          error: `허용되지 않는 상태 변경입니다 (현재: ${reservation.status} → 요청: ${newStatus})`,
        },
        { status: 400 }
      );
    }

    // 4. 상태 업데이트
    const updateData: { status: string; reject_reason?: string } = {
      status: newStatus,
    };

    if (newStatus === "REJECTED" && reject_reason) {
      updateData.reject_reason = reject_reason;
    }

    const { data: updated, error: updateError } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", id)
      .select(
        `id, reservation_no, status, reject_reason,
         client_name, client_phone, client_email,
         preferred_date, preferred_time,
         attorney:attorneys(name)`
      )
      .single<UpdatedReservation>();

    if (updateError || !updated) {
      console.error("[PATCH] update/select 실패:", { updateError, updated });
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 5. 상태별 사용자 알림 (이메일 + SMS Mock)
    if (newStatus === "CONFIRMED") {
      await notifyUserConfirmed(updated);
    } else if (newStatus === "REJECTED") {
      await notifyUserRejected(updated);
    }

    // 응답은 기존 shape 유지
    return NextResponse.json({
      data: {
        id: updated.id,
        reservation_no: updated.reservation_no,
        status: updated.status,
        reject_reason: updated.reject_reason,
      },
    });
  } catch (e) {
    console.error("[PATCH] 예외:", e);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

async function notifyUserConfirmed(row: UpdatedReservation): Promise<void> {
  const email = buildUserConfirmedEmail({
    reservation_no: row.reservation_no,
    client_name: row.client_name,
    attorney_name: row.attorney?.name ?? null,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
  });

  try {
    await sendEmail(row.client_email, email.subject, email.html);
  } catch (e) {
    console.error("[Notify] 사용자 확정 이메일 예외:", e);
  }

  try {
    const timeShort = row.preferred_time.slice(0, 5);
    await sendSMS(
      row.client_phone,
      `[${SITE.name}] 예약이 확정되었습니다. ${row.reservation_no} ${row.preferred_date} ${timeShort} 사무소 방문 부탁드립니다.`
    );
  } catch (e) {
    console.error("[Notify] 사용자 확정 SMS Mock 예외:", e);
  }
}

async function notifyUserRejected(row: UpdatedReservation): Promise<void> {
  const email = buildUserRejectedEmail({
    reservation_no: row.reservation_no,
    client_name: row.client_name,
    reject_reason: row.reject_reason,
  });

  try {
    await sendEmail(row.client_email, email.subject, email.html);
  } catch (e) {
    console.error("[Notify] 사용자 반려 이메일 예외:", e);
  }

  try {
    const reasonShort = (row.reject_reason ?? "").trim().slice(0, 40) || "관리자 확인 필요";
    await sendSMS(
      row.client_phone,
      `[${SITE.name}] 예약 ${row.reservation_no} 이 반려되었습니다. 사유: ${reasonShort}`
    );
  } catch (e) {
    console.error("[Notify] 사용자 반려 SMS Mock 예외:", e);
  }
}
