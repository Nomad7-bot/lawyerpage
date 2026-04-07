import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { changeReservationSchema } from "@/lib/schemas/reservation";

/**
 * POST /api/reservations/change — 일정 변경
 * PENDING 상태에서만 변경 가능
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = changeReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reservation_no, client_phone, new_date, new_time } = parsed.data;

    const supabase = await createClient();

    // 1. 예약 조회
    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, status, attorney_id")
      .eq("reservation_no", reservation_no)
      .eq("client_phone", client_phone)
      .single();

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
