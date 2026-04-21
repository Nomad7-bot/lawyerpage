"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { siteSettingsInputSchema } from "@/lib/schemas/seo";

import type { ActionResult } from "@/lib/schemas/content";

/**
 * singleton UPDATE — id 로 지정해서 1행만 갱신.
 * 기존 행이 없으면 INSERT 로 생성.
 */
export async function updateSiteSettings(
  id: string | null,
  input: unknown
): Promise<ActionResult> {
  const parsed = siteSettingsInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  try {
    const supabase = createAdminClient();
    const payload = {
      firm_name: parsed.data.firm_name,
      address: parsed.data.address,
      phone: parsed.data.phone,
      fax: parsed.data.fax,
      email: parsed.data.email,
      business_hours: parsed.data.business_hours,
      blog_url: parsed.data.blog_url,
      instagram_url: parsed.data.instagram_url,
      default_title_template: parsed.data.default_title_template,
      default_description: parsed.data.default_description,
      default_og_image: parsed.data.default_og_image,
    };

    if (id) {
      const { error } = await supabase
        .from("site_settings")
        .update(payload)
        .eq("id", id);
      if (error) {
        console.error("[action] updateSiteSettings UPDATE 실패", error);
        return { ok: false, error: "저장에 실패했습니다" };
      }
    } else {
      const { error } = await supabase.from("site_settings").insert(payload);
      if (error) {
        console.error("[action] updateSiteSettings INSERT 실패", error);
        return { ok: false, error: "저장에 실패했습니다" };
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");
    return { ok: true };
  } catch (e) {
    console.error("[action] updateSiteSettings 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}
