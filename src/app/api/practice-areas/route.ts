import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PracticeAreaListItem } from "@/types";

/**
 * GET /api/practice-areas
 * 활성 업무분야 목록 — 예약 Step3(상담분야 선택)에서 사용.
 * 서버 경유로 same-origin 요청화하여 모바일 브라우저 제약 우회.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("practice_areas")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "상담분야 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { practice_areas: (data ?? []) as PracticeAreaListItem[] },
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
