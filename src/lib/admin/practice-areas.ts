import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { PracticeAreaFull } from "@/types";

export type PracticeAreaListItemAdmin = {
  id: string;
  name: string;
  slug: string;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
};

export async function getPracticeAreasAdmin(): Promise<
  PracticeAreaListItemAdmin[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("practice_areas")
    .select("id, name, slug, icon_name, display_order, is_active")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin/practice-areas] 목록 조회 실패", error);
    return [];
  }
  return (data ?? []) as PracticeAreaListItemAdmin[];
}

export async function getPracticeArea(
  id: string
): Promise<PracticeAreaFull | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("practice_areas")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[admin/practice-areas] 단건 조회 실패", error);
    }
    return null;
  }
  return data as PracticeAreaFull;
}
