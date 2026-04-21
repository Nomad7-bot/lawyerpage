import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { SiteSettings } from "@/types";

/**
 * site_settings 는 singleton — 첫 번째 행 반환.
 * 없으면 null (seed 누락 시).
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[admin/site-settings] 조회 실패", error);
    return null;
  }
  return (data as SiteSettings | null) ?? null;
}
