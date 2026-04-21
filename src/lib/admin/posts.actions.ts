"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUniqueSlug } from "@/lib/admin/slug";
import { postInputSchema } from "@/lib/schemas/content";

import type { ActionResult } from "@/lib/schemas/content";

/**
 * 게시글 생성 — Server Action.
 *
 * 성공 시 `/admin/contents?tab=posts` 를 revalidate 하고 새 id 반환.
 */
export async function createPost(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug("posts", data.slug, data.title);
    const supabase = createAdminClient();

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert({
        title: data.title,
        slug: uniqueSlug,
        category_id: data.category_id,
        content: data.content,
        excerpt: data.excerpt,
        thumbnail: data.thumbnail,
        og_image: data.og_image,
        tags: data.tags,
        author_id: data.author_id,
        is_published: data.is_published,
        published_at: data.is_published
          ? data.published_at ?? new Date().toISOString().slice(0, 10)
          : null,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[action] createPost 실패", error);
      return { ok: false, error: "게시글 저장에 실패했습니다" };
    }

    revalidatePath("/admin/contents");
    return { ok: true, data: { id: inserted.id as string } };
  } catch (e) {
    console.error("[action] createPost 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function updatePost(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = postInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다",
    };
  }
  const data = parsed.data;

  try {
    const uniqueSlug = await ensureUniqueSlug(
      "posts",
      data.slug,
      data.title,
      id
    );
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("posts")
      .update({
        title: data.title,
        slug: uniqueSlug,
        category_id: data.category_id,
        content: data.content,
        excerpt: data.excerpt,
        thumbnail: data.thumbnail,
        og_image: data.og_image,
        tags: data.tags,
        author_id: data.author_id,
        is_published: data.is_published,
        published_at: data.is_published
          ? data.published_at ?? new Date().toISOString().slice(0, 10)
          : null,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      })
      .eq("id", id);

    if (error) {
      console.error("[action] updatePost 실패", error);
      return { ok: false, error: "게시글 업데이트에 실패했습니다" };
    }

    revalidatePath("/admin/contents");
    revalidatePath(`/admin/contents/posts/${id}/edit`);
    return { ok: true };
  } catch (e) {
    console.error("[action] updatePost 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[action] deletePost 실패", error);
      return { ok: false, error: "게시글 삭제에 실패했습니다" };
    }
    revalidatePath("/admin/contents");
    return { ok: true };
  } catch (e) {
    console.error("[action] deletePost 예외", e);
    return { ok: false, error: "서버 오류가 발생했습니다" };
  }
}
