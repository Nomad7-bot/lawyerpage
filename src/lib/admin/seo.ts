import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { SeoSetting } from "@/types";

export async function getSeoSettings(): Promise<SeoSetting[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .order("page_url", { ascending: true });
  if (error) {
    console.error("[admin/seo] 목록 조회 실패", error);
    return [];
  }
  return (data ?? []) as SeoSetting[];
}

export async function getSeoSetting(id: string): Promise<SeoSetting | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[admin/seo] 단건 조회 실패", error);
    }
    return null;
  }
  return data as SeoSetting;
}

