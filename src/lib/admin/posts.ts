import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { Post, PostCategory } from "@/types";

export const POSTS_PAGE_SIZE = 10;

export type PostsFilter = {
  categoryId?: string | "ALL";
  published?: "ALL" | "YES" | "NO";
  q?: string;
  page?: number;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  category_name: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
};

export type PostListResult = {
  rows: PostRow[];
  total: number;
  page: number;
  pageSize: number;
};

type JoinedPostRow = Omit<PostRow, "category_name"> & {
  category: { name: string } | { name: string }[] | null;
};

export async function getPosts(filter: PostsFilter): Promise<PostListResult> {
  const supabase = createAdminClient();
  const page = Math.max(1, filter.page ?? 1);
  const from = (page - 1) * POSTS_PAGE_SIZE;
  const to = from + POSTS_PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select(
      `id, title, slug, is_published, published_at, view_count, created_at,
       category:post_categories(name)`,
      { count: "exact" }
    );

  if (filter.categoryId && filter.categoryId !== "ALL") {
    query = query.eq("category_id", filter.categoryId);
  }
  if (filter.published === "YES") {
    query = query.eq("is_published", true);
  } else if (filter.published === "NO") {
    query = query.eq("is_published", false);
  }
  if (filter.q && filter.q.trim().length > 0) {
    // title ilike 부분 일치 — 간단한 키워드 검색
    query = query.ilike("title", `%${filter.q.trim()}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[admin/posts] 목록 조회 실패", error);
    return { rows: [], total: 0, page, pageSize: POSTS_PAGE_SIZE };
  }

  const rows: PostRow[] = (data as unknown as JoinedPostRow[]).map((row) => {
    const category = Array.isArray(row.category)
      ? row.category[0]
      : row.category;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      is_published: row.is_published,
      published_at: row.published_at,
      view_count: row.view_count,
      created_at: row.created_at,
      category_name: category?.name ?? null,
    };
  });

  return { rows, total: count ?? 0, page, pageSize: POSTS_PAGE_SIZE };
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    if (error && error.code !== "PGRST116") {
      console.error("[admin/posts] 단건 조회 실패", error);
    }
    return null;
  }
  return data as Post;
}

export async function getPostCategories(): Promise<PostCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("post_categories")
    .select("id, name, slug, display_order")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin/posts] 카테고리 조회 실패", error);
    return [];
  }
  return (data ?? []) as PostCategory[];
}

/**
 * 작성자 선택용 변호사 옵션 (id + name, display_order 정렬).
 */
export async function getAuthorOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("attorneys")
    .select("id, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin/posts] 작성자 옵션 조회 실패", error);
    return [];
  }
  return (data ?? []).map((a) => ({
    id: a.id as string,
    name: a.name as string,
  }));
}
