import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { changeReservationSchema } from "@/lib/schemas/reservation";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { buildAdminChangedEmail } from "@/lib/email-templates";
import { SITE } from "@/constants/site";

type ExistingReservation = {
  id: string;
  status: string;
  attorney_id: string | null;
  reservation_no: string;
  client_name: string;
  preferred_date: string;
  preferred_time: string;
};

/**
 * POST /api/reservations/change — 일정 변경
 * PENDING 상태에서만 변경 가능
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = changeReservationSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.flatten().fieldErrors;
      console.error("[Change] 검증 실패:", { body, details });
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details },
        { status: 400 }
      );
    }

    const { reservation_no, client_phone, new_date, new_time } = parsed.data;

    const supabase = await createClient();

    // 1. 예약 조회 (알림용 기존 일시 포함)
    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, status, attorney_id, reservation_no, client_name, preferred_date, preferred_time")
      .eq("reservation_no", reservation_no)
      .eq("client_phone", client_phone)
      .single<ExistingReservation>();

    if (findError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 2. PENDING 상태만 변경 가능
    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: `일정 변경이 불가능한 상태입니다 (현재 상태: ${reservation.status})` },
        { status: 400 }
      );
    }

    // 3. 새 일시 중복 체크
    let duplicateQuery = supabase
      .from("reservations")
      .select("id")
      .eq("preferred_date", new_date)
      .eq("preferred_time", `${new_time}:00`)
      .in("status", ["PENDING", "CONFIRMED"])
      .neq("id", reservation.id);

    if (reservation.attorney_id) {
      duplicateQuery = duplicateQuery.eq("attorney_id", reservation.attorney_id);
    } else {
      duplicateQuery = duplicateQuery.is("attorney_id", null);
    }

    const { data: existing, error: dupError } = await duplicateQuery;

    if (dupError) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "해당 일시에 이미 예약이 존재합니다" },
        { status: 409 }
      );
    }

    // 4. 일정 변경
    const { data: updated, error: updateError } = await supabase
      .from("reservations")
      .update({
        preferred_date: new_date,
        preferred_time: `${new_time}:00`,
      })
      .eq("id", reservation.id)
      .select("reservation_no, preferred_date, preferred_time, status")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 5. 관리자 알림 (기존 일시 + 신규 일시)
    await notifyAdminChanged({
      reservation_no: reservation.reservation_no,
      client_name: reservation.client_name,
      old_date: reservation.preferred_date,
      old_time: reservation.preferred_time,
      new_date,
      new_time,
    });

    return NextResponse.json({
      data: {
        reservation_no: updated.reservation_no,
        preferred_date: updated.preferred_date,
        preferred_time: updated.preferred_time.slice(0, 5),
        status: updated.status,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

async function notifyAdminChanged(params: {
  reservation_no: string;
  client_name: string;
  old_date: string;
  old_time: string;
  new_date: string;
  new_time: string;
}): Promise<void> {
  const email = buildAdminChangedEmail(params);

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("[Notify] ADMIN_EMAIL 미설정 — 관리자 변경 이메일 생략");
  } else {
    try {
      await sendEmail(adminEmail, email.subject, email.html);
    } catch (e) {
      console.error("[Notify] 관리자 변경 이메일 예외:", e);
    }
  }

  try {
    const oldShort = params.old_time.slice(0, 5);
    const newShort = params.new_time.slice(0, 5);
    await sendSMS(
      SITE.nap.phone,
      `[${SITE.name}] 일정 변경 ${params.reservation_no} / ${params.old_date} ${oldShort} → ${params.new_date} ${newShort}`
    );
  } catch (e) {
    console.error("[Notify] 관리자 변경 SMS Mock 예외:", e);
  }
}
