import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createReservationSchema } from "@/lib/schemas/reservation";
import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/sms";
import { buildAdminNewReservationEmail } from "@/lib/email-templates";
import { SITE } from "@/constants/site";

/**
 * INSERT 이후 JOIN 으로 함께 조회되는 행 모양
 * Supabase PostgREST 는 FK 단일 관계를 단일 객체로 반환
 */
type ReservationWithJoin = {
  id: string;
  reservation_no: string;
  status: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  consultation_note: string | null;
  preferred_date: string;
  preferred_time: string;
  attorney: { name: string } | null;
  practice_area: { name: string } | null;
};

const INSERT_SELECT = `
  id, reservation_no, status, client_name, client_phone, client_email,
  consultation_note, preferred_date, preferred_time,
  attorney:attorneys(name),
  practice_area:practice_areas(name)
`;

/**
 * POST /api/reservations — 예약 신청
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      attorney_id,
      client_name,
      client_phone,
      client_email,
      practice_area_id,
      consultation_note,
      preferred_date,
      preferred_time,
    } = parsed.data;

    const supabase = await createClient();

    // 1. 중복 예약 체크 (동일 변호사 + 날짜 + 시간, PENDING/CONFIRMED)
    let duplicateQuery = supabase
      .from("reservations")
      .select("id")
      .eq("preferred_date", preferred_date)
      .eq("preferred_time", `${preferred_time}:00`)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (attorney_id) {
      duplicateQuery = duplicateQuery.eq("attorney_id", attorney_id);
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

    // 2. 예약번호 생성: R-YYYYMMDD-XXX
    const reservationNo = await generateReservationNo(supabase, preferred_date);

    // 3. 예약 INSERT
    const insertPayload = {
      reservation_no: reservationNo,
      attorney_id: attorney_id ?? null,
      client_name,
      client_phone,
      client_email,
      practice_area_id,
      consultation_note: consultation_note ?? null,
      preferred_date,
      preferred_time: `${preferred_time}:00`,
      status: "PENDING",
    };

    const { data: reservation, error: insertError } = await supabase
      .from("reservations")
      .insert(insertPayload)
      .select(INSERT_SELECT)
      .single<ReservationWithJoin>();

    if (insertError) {
      // UNIQUE 제약 위반 시 1회 재시도
      if (insertError.code === "23505") {
        const retryNo = await generateReservationNo(supabase, preferred_date);
        const { data: retryData, error: retryError } = await supabase
          .from("reservations")
          .insert({ ...insertPayload, reservation_no: retryNo })
          .select(INSERT_SELECT)
          .single<ReservationWithJoin>();

        if (retryError || !retryData) {
          return NextResponse.json(
            { error: "서버 오류가 발생했습니다" },
            { status: 500 }
          );
        }

        await notifyAdminNewReservation(retryData);
        return NextResponse.json(
          { data: { reservation_no: retryData.reservation_no, status: retryData.status } },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!reservation) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    await notifyAdminNewReservation(reservation);
    return NextResponse.json(
      { data: { reservation_no: reservation.reservation_no, status: reservation.status } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 예약번호 생성: R-YYYYMMDD-XXX (당일 순번 기반)
 */
async function generateReservationNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  date: string
): Promise<string> {
  const dateCompact = date.replace(/-/g, "");
  const prefix = `R-${dateCompact}-`;

  const { count } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .like("reservation_no", `${prefix}%`);

  const seq = String((count ?? 0) + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}

/**
 * 관리자에게 신규 예약 알림 (이메일 + SMS Mock)
 * 알림 실패는 예약 성공 응답을 막지 않는다 — 로깅만 처리
 */
async function notifyAdminNewReservation(row: ReservationWithJoin): Promise<void> {
  const email = buildAdminNewReservationEmail({
    reservation_no: row.reservation_no,
    client_name: row.client_name,
    client_phone: row.client_phone,
    client_email: row.client_email,
    attorney_name: row.attorney?.name ?? null,
    practice_area_name: row.practice_area?.name ?? null,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
    consultation_note: row.consultation_note,
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("[Notify] ADMIN_EMAIL 미설정 — 관리자 이메일 생략");
  } else {
    try {
      await sendEmail(adminEmail, email.subject, email.html);
    } catch (e) {
      console.error("[Notify] 관리자 이메일 발송 예외:", e);
    }
  }

  try {
    const timeShort = row.preferred_time.slice(0, 5);
    await sendSMS(
      SITE.nap.phone,
      `[${SITE.name}] 신규 예약 접수 ${row.reservation_no} / ${row.client_name} / ${row.preferred_date} ${timeShort}`
    );
  } catch (e) {
    console.error("[Notify] 관리자 SMS Mock 예외:", e);
  }
}
