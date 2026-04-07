import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createReservationSchema } from "@/lib/schemas/reservation";

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
    const { data: reservation, error: insertError } = await supabase
      .from("reservations")
      .insert({
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
      })
      .select("reservation_no, status")
      .single();

    if (insertError) {
      // UNIQUE 제약 위반 시 1회 재시도
      if (insertError.code === "23505") {
        const retryNo = await generateReservationNo(supabase, preferred_date);
        const { data: retryData, error: retryError } = await supabase
          .from("reservations")
          .insert({
            reservation_no: retryNo,
            attorney_id: attorney_id ?? null,
            client_name,
            client_phone,
            client_email,
            practice_area_id,
            consultation_note: consultation_note ?? null,
            preferred_date,
            preferred_time: `${preferred_time}:00`,
            status: "PENDING",
          })
          .select("reservation_no, status")
          .single();

        if (retryError) {
          return NextResponse.json(
            { error: "서버 오류가 발생했습니다" },
            { status: 500 }
          );
        }

        return NextResponse.json({ data: retryData }, { status: 201 });
      }

      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: reservation }, { status: 201 });
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
