import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { lookupReservationSchema } from "@/lib/schemas/reservation";
import type { ReservationLookupResult } from "@/types";

/**
 * POST /api/reservations/lookup — 예약 조회
 * 예약번호 + 연락처로 본인 예약 확인
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = lookupReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reservation_no, client_phone } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("reservations")
      .select("*, attorneys(name), practice_areas(name)")
      .eq("reservation_no", reservation_no)
      .eq("client_phone", client_phone)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "예약 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 연락처 마스킹: 010-1234-5678 → 010-****-5678
    const maskedPhone = data.client_phone.replace(
      /(\d{3})-(\d{4})-(\d{4})/,
      "$1-****-$3"
    );

    const result: ReservationLookupResult = {
      reservation_no: data.reservation_no,
      status: data.status,
      client_name: data.client_name,
      client_phone: maskedPhone,
      client_email: data.client_email,
      attorney_id: data.attorney_id,
      attorney_name: data.attorneys?.name ?? null,
      practice_area_name: data.practice_areas?.name ?? null,
      consultation_note: data.consultation_note,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time.slice(0, 5),
      reject_reason: data.reject_reason,
      created_at: data.created_at,
    };

    return NextResponse.json({ data: result });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
