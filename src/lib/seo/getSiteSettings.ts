import { createClient } from "@/lib/supabase/server";

/**
 * site_settings 테이블의 SEO 기본값 (1행 유지 테이블).
 * anon RLS 정책이 SELECT 허용이므로 서버 컴포넌트에서 직접 호출 가능.
 * 실패 시 null 반환 — buildMetadata 에서 SITE 상수 fallback.
 */
export interface SiteSettingsSeoRow {
  default_title_template: string | null;
  default_description: string | null;
  default_og_image: string | null;
}

export async function getSiteSettings(): Promise<SiteSettingsSeoRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("default_title_template, default_description, default_og_image")
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as SiteSettingsSeoRow;
  } catch {
    return null;
  }
}
