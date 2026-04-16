import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { cancelReservationSchema } from "@/lib/schemas/reservation";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { buildAdminCancelledEmail } from "@/lib/email-templates";
import { SITE } from "@/constants/site";

type CancelReservationRow = {
  id: string;
  status: string;
  reservation_no: string;
  client_name: string;
  preferred_date: string;
  preferred_time: string;
};

/**
 * POST /api/reservations/cancel — 예약 취소
 * PENDING 또는 CONFIRMED 상태만 취소 가능
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cancelReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reservation_no, client_phone } = parsed.data;

    const supabase = await createClient();

    // 1. 예약 조회 (알림에 필요한 필드까지 한 번에 확보)
    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, status, reservation_no, client_name, preferred_date, preferred_time")
      .eq("reservation_no", reservation_no)
      .eq("client_phone", client_phone)
      .single<CancelReservationRow>();

    if (findError || !reservation) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 2. 취소 가능 상태 확인
    if (reservation.status !== "PENDING" && reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: `취소할 수 없는 상태입니다 (현재 상태: ${reservation.status})` },
        { status: 400 }
      );
    }

    // 3. 상태 변경
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "CANCELLED" })
      .eq("id", reservation.id);

    if (updateError) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // 4. 관리자 알림
    await notifyAdminCancelled(reservation);

    return NextResponse.json({ data: { status: "CANCELLED" } });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

async function notifyAdminCancelled(row: CancelReservationRow): Promise<void> {
  const email = buildAdminCancelledEmail({
    reservation_no: row.reservation_no,
    client_name: row.client_name,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("[Notify] ADMIN_EMAIL 미설정 — 관리자 취소 이메일 생략");
  } else {
    try {
      await sendEmail(adminEmail, email.subject, email.html);
    } catch (e) {
      console.error("[Notify] 관리자 취소 이메일 예외:", e);
    }
  }

  try {
    const timeShort = row.preferred_time.slice(0, 5);
    await sendSMS(
      SITE.nap.phone,
      `[${SITE.name}] 예약 취소 ${row.reservation_no} / ${row.client_name} / ${row.preferred_date} ${timeShort}`
    );
  } catch (e) {
    console.error("[Notify] 관리자 취소 SMS Mock 예외:", e);
  }
}
