import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AttorneyListItem } from "@/types";

/**
 * GET /api/attorneys
 * 활성 변호사 목록 — 예약 Step1 에서 사용.
 *
 * 서버 경유 이유: 브라우저 직접 Supabase 호출은 모바일 브라우저의 CORS/ITP/
 * 콘텐츠 차단 정책에 걸려 실패하는 경우가 있어, 동일 origin API 로 래핑한다.
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("attorneys")
      .select(
        "id, name, slug, position, attorney_practice_areas(practice_areas(name))"
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "변호사 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const attorneys: AttorneyListItem[] = (data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      position: row.position as string,
      specialties: (
        ((row as Record<string, unknown>).attorney_practice_areas as {
          practice_areas: { name: string } | null;
        }[] ?? [])
      )
        .map((apa) => apa.practice_areas?.name)
        .filter((n): n is string => !!n),
    }));

    return NextResponse.json({ data: { attorneys } });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
