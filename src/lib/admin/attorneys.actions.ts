"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { attorneyInputSchema } from "@/lib/schemas/content";

import type { ActionResult } from "@/lib/schemas/content";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function slotEndTime(start: string): string {
  // "HH:MM" → 30분 뒤 "HH:MM:00"
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + 30;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${pad(nh)}:${pad(nm)}:00`;
}

async function syncRelations(
  id: string,
  practiceAreaIds: string[],
  availableSlots: { day_of_week: number; start_time: string }[]
) {
  const supabase = createAdminClient();

  // 업무분야: 전체 삭제 후 재삽입
  const { error: delPa } = await supabase
    .from("attorney_practice_areas")
    .delete()
    .eq("attorney_id", id);
  if (delPa) throw new Error(`업무분야 매핑 초기화 실패: ${delPa.message}`);

  if (practiceAreaIds.length > 0) {
    const rows = practiceAreaIds.map((paid) => ({
      attorney_id: id,
      practice_area_id: paid,
    }));
    const { error } = await supabase
      .from("attorney_practice_areas")
      .insert(rows);
    if (error) throw new Error(`업무분야 매핑 저장 실패: ${error.message}`);
  }

  // 상담 가능 시간: 전체 삭제 후 재삽입
  const { error: delSlot } = await supabase
    .from("available_slots")
    .delete()
    .eq("attorney_id", id);
  if (delSlot) throw new Error(`가용 시간 초기화 실패: ${delSlot.message}`);

  if (availableSlots.length > 0) {
    const rows = availableSlots.map((s) => ({
      attorney_id: id,
      day_of_week: s.day_of_week,
      start_time: `${s.start_time}:00`,
      end_time: slotEndTime(s.start_time),
      is_active: true,
    }));
    const { error } = await supabase.from("available_slots").insert(rows);
    if (error) throw new Error(`가용 시간 저장 실패: ${error.message}`);
  }
}

export async function createAttorney(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = attorneyInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug(
      "attorneys",
      data.slug,
      data.name
    );
    const supabase = createAdminClient();

    // display_order 자동: 현재 max + 1
    const { data: maxRow } = await supabase
      .from("attorneys")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.display_order ?? 0) + 1;

    const { data: inserted, error } = await supabase
      .from("attorneys")
      .insert({
        name: data.name,
        slug: uniqueSlug,
        position: data.position,
        profile_image: data.profile_image,
        bio: data.bio,
        career: data.career,
        is_active: data.is_active,
        display_order: nextOrder,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[action] createAttorney 실패", error);
      return { ok: false, error: "변호사 저장에 실패했습니다" };
    }

    await syncRelations(
      inserted.id as string,
      data.practice_area_ids,
      data.available_slots
    );

    revalidatePath("/admin/contents");
    return { ok: true, data: { id: inserted.id as string } };
  } catch (e) {
    console.error("[action] createAttorney 예외", e);
    const msg = e instanceof Error ? e.message : "서버 오류가 발생했습니다";
    return { ok: false, error: msg };
  }
}

export async function updateAttorney(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = attorneyInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug(
      "attorneys",
      data.slug,
      data.name,
      id
    );
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("attorneys")
      .update({
        name: data.name,
        slug: uniqueSlug,
        position: data.position,
        profile_image: data.profile_image,
        bio: data.bio,
        career: data.career,
        is_active: data.is_active,
      })
      .eq("id", id);

    if (error) {
      console.error("[action] updateAttorney 실패", error);
      return { ok: false, error: "변호사 업데이트에 실패했습니다" };
    }

    await syncRelations(id, data.practice_area_ids, data.available_slots);

    revalidatePath("/admin/contents");
    revalidatePath(`/admin/contents/attorneys/${id}/edit`);
    return { ok: true };
  } catch (e) {
    console.error("[action] updateAttorney 예외", e);
    const msg = e instanceof Error ? e.message : "서버 오류가 발생했습니다";
    return { ok: false, error: msg };
  }
}

export async function deleteAttorney(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    // attorney_practice_areas / available_slots 는 ON DELETE CASCADE 가정
    const { error } = await supabase.from("attorneys").delete().eq("id", id);
    if (error) {
      console.error("[action] deleteAttorney 실패", error);
      return { ok: false, error: "변호사 삭제에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch (e) {
    console.error("[action] deleteAttorney 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function reorderAttorneys(ids: string[]): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    // 순차 UPDATE. 중복 키 이슈 없고 수 적어 병렬 수행 가능.
    await Promise.all(
      ids.map((id, idx) =>
        supabase
          .from("attorneys")
          .update({ display_order: idx + 1 })
          .eq("id", id)
      )
    );
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch (e) {
    console.error("[action] reorderAttorneys 예외", e);
    return { ok: false, error: "순서 저장에 실패했습니다" };
  }
}

export async function toggleAttorneyActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("attorneys")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) {
      return { ok: false, error: "활성 상태 변경에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch {
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}
