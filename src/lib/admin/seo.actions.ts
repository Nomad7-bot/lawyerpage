"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { seoUpdateSchema } from "@/lib/schemas/seo";

import type { ActionResult } from "@/lib/schemas/content";

export async function updateSeoSetting(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = seoUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("seo_settings")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      console.error("[action] updateSeoSetting 실패", error);
      return { ok: false, error: "SEO 설정 저장에 실패했습니다" };
    }
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    console.error("[action] updateSeoSetting 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}
