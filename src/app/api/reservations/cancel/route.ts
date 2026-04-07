import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { cancelReservationSchema } from "@/lib/schemas/reservation";

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

    // 1. 예약 조회
    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, status")
      .eq("reservation_no", reservation_no)
      .eq("client_phone", client_phone)
      .single();

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

    return NextResponse.json({ data: { status: "CANCELLED" } });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
