import { createClient } from "@/lib/supabase/server";

/**
 * 페이지별 SEO 오버라이드 (관리자 CMS 에서 저장). page_name UNIQUE.
 * 현재 RLS 가 authenticated-only 이므로 anon 컨텍스트에서는 null 반환 —
 * 추후 RLS 개방 또는 service_role 도입 시 자동 동작.
 */
export interface SeoSettingsRow {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
}

export async function getSeoSettings(
  pageName: string
): Promise<SeoSettingsRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("seo_settings")
      .select(
        "meta_title, meta_description, og_title, og_description, og_image, canonical_url"
      )
      .eq("page_name", pageName)
      .maybeSingle();

    if (error || !data) return null;
    return data as SeoSettingsRow;
  } catch {
    return null;
  }
}
