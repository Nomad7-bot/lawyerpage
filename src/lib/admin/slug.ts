import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slugify";

type SluggableTable = "posts" | "attorneys" | "practice_areas";

/**
 * DB UNIQUE(slug) 제약을 피해 고유 slug 를 보장한다.
 *
 * - 빈 문자열이면 baseName 에서 slug 를 생성하고, 그것도 비면 `item-{timestamp}` fallback
 * - 중복 시 `-2`, `-3` ... 순으로 증가. 최대 50회 시도 후 포기 (timestamp fallback)
 * - 수정 모드는 `excludeId` 로 자기 자신 제외
 */
export async function ensureUniqueSlug(
  table: SluggableTable,
  baseSlug: string,
  baseName?: string,
  excludeId?: string
): Promise<string> {
  const supabase = createAdminClient();

  let candidate = baseSlug.trim();
  if (candidate.length === 0 && baseName) {
    candidate = slugify(baseName);
  }
  if (candidate.length === 0) {
    candidate = `item-${Date.now()}`;
  }

  for (let i = 0; i < 50; i += 1) {
    const test = i === 0 ? candidate : `${candidate}-${i + 1}`;
    let query = supabase.from(table).select("id").eq("slug", test).limit(1);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data, error } = await query;
    if (error) {
      console.error(`[slug] ${table} 조회 실패`, error);
      throw new Error("슬러그 중복 확인 중 오류가 발생했습니다");
    }
    if (!data || data.length === 0) {
      return test;
    }
  }
  return `${candidate}-${Date.now()}`;
}
