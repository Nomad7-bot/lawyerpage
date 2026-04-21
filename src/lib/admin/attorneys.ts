import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { AttorneyFull, AvailableSlot, CareerItem } from "@/types";

export type AttorneyListItemAdmin = {
  id: string;
  name: string;
  slug: string;
  position: string | null;
  profile_image: string | null;
  display_order: number;
  is_active: boolean;
};

export async function getAttorneysAdmin(): Promise<AttorneyListItemAdmin[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("attorneys")
    .select("id, name, slug, position, profile_image, display_order, is_active")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin/attorneys] 목록 조회 실패", error);
    return [];
  }
  return (data ?? []) as AttorneyListItemAdmin[];
}

type JoinedAttorneyRow = {
  id: string;
  name: string;
  slug: string;
  position: string | null;
  profile_image: string | null;
  bio: string | null;
  career: CareerItem[] | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  practice_areas: { practice_area_id: string }[];
  available_slots: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
  }[];
};

export async function getAttorney(id: string): Promise<AttorneyFull | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("attorneys")
    .select(
      `id, name, slug, position, profile_image, bio, career, display_order, is_active, created_at, updated_at,
       practice_areas:attorney_practice_areas(practice_area_id),
       available_slots:available_slots(day_of_week, start_time, end_time, is_active)`
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[admin/attorneys] 단건 조회 실패", error);
    }
    return null;
  }

  const row = data as unknown as JoinedAttorneyRow;
  const slots: AvailableSlot[] = (row.available_slots ?? []).map((s) => ({
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    is_active: s.is_active,
  }));

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    position: row.position,
    profile_image: row.profile_image,
    bio: row.bio,
    career: row.career ?? [],
    display_order: row.display_order,
    is_active: row.is_active,
    practice_area_ids: (row.practice_areas ?? []).map((p) => p.practice_area_id),
    available_slots: slots,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * 업무분야 옵션 (변호사 편집 시 체크박스용).
 */
export async function getPracticeAreaOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("practice_areas")
    .select("id, name")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin/attorneys] 업무분야 옵션 조회 실패", error);
    return [];
  }
  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
  }));
}
