"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { practiceAreaInputSchema } from "@/lib/schemas/content";

import type { ActionResult } from "@/lib/schemas/content";

export async function createPracticeArea(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = practiceAreaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug(
      "practice_areas",
      data.slug,
      data.name
    );
    const supabase = createAdminClient();

    const { data: maxRow } = await supabase
      .from("practice_areas")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.display_order ?? 0) + 1;

    const { data: inserted, error } = await supabase
      .from("practice_areas")
      .insert({
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        detail_content: data.detail_content,
        icon_name: data.icon_name,
        is_active: data.is_active,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        display_order: nextOrder,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[action] createPracticeArea 실패", error);
      return { ok: false, error: "업무분야 저장에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    return { ok: true, data: { id: inserted.id as string } };
  } catch (e) {
    console.error("[action] createPracticeArea 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function updatePracticeArea(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = practiceAreaInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug(
      "practice_areas",
      data.slug,
      data.name,
      id
    );
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("practice_areas")
      .update({
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        detail_content: data.detail_content,
        icon_name: data.icon_name,
        is_active: data.is_active,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      })
      .eq("id", id);

    if (error) {
      console.error("[action] updatePracticeArea 실패", error);
      return { ok: false, error: "업무분야 업데이트에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    revalidatePath(`/admin/contents/practice-areas/${id}/edit`);
    return { ok: true };
  } catch (e) {
    console.error("[action] updatePracticeArea 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function deletePracticeArea(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("practice_areas")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[action] deletePracticeArea 실패", error);
      return { ok: false, error: "업무분야 삭제에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch (e) {
    console.error("[action] deletePracticeArea 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function reorderPracticeAreas(
  ids: string[]
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    await Promise.all(
      ids.map((id, idx) =>
        supabase
          .from("practice_areas")
          .update({ display_order: idx + 1 })
          .eq("id", id)
      )
    );
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch (e) {
    console.error("[action] reorderPracticeAreas 예외", e);
    return { ok: false, error: "순서 저장에 실패했습니다" };
  }
}

export async function togglePracticeAreaActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("practice_areas")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) return { ok: false, error: "활성 상태 변경에 실패했습니다" };
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch {
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}
