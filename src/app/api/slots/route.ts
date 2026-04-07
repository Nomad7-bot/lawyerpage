import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSlotsQuerySchema } from "@/lib/schemas/reservation";
import type { TimeSlot } from "@/types";

/**
 * GET /api/slots?attorney_id=xxx&date=2026-04-10
 * 변호사별 가용 시간 슬롯 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = getSlotsQuerySchema.safeParse({
      attorney_id: searchParams.get("attorney_id"),
      date: searchParams.get("date"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { attorney_id, date } = parsed.data;

    // 날짜에서 요일 계산 (UTC 오프셋 방지를 위해 수동 파싱)
    const [y, m, d] = date.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();

    const supabase = await createClient();

    // 1. 해당 변호사의 해당 요일 available_slots 조회
    const { data: slots, error: slotsError } = await supabase
      .from("available_slots")
      .select("start_time")
      .eq("attorney_id", attorney_id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (slotsError) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!slots || slots.length === 0) {
      return NextResponse.json({ data: { slots: [] } });
    }

    // 2. 해당 날짜에 이미 예약된 시간 조회 (PENDING/CONFIRMED)
    const { data: booked, error: bookedError } = await supabase
      .from("reservations")
      .select("preferred_time")
      .eq("attorney_id", attorney_id)
      .eq("preferred_date", date)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (bookedError) {
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // Supabase TIME은 "HH:MM:SS" → "HH:MM"으로 정규화
    const bookedTimes = new Set(
      (booked ?? []).map((r) => r.preferred_time.slice(0, 5))
    );

    // 3. 각 슬롯의 가용 여부 매핑
    const timeSlots: TimeSlot[] = slots.map((slot) => {
      const time = slot.start_time.slice(0, 5);
      return {
        time,
        available: !bookedTimes.has(time),
      };
    });

    return NextResponse.json({ data: { slots: timeSlots } });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
