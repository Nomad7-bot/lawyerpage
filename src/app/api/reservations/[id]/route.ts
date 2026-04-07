import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { adminUpdateSchema } from "@/lib/schemas/reservation";
import type { ReservationStatus } from "@/types";

// 허용되는 상태 전이 규칙
const VALID_TRANSITIONS: Record<string, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
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
      .select("id, reservation_no, status, reject_reason")
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
