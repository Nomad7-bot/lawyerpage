/**
 * 공개 페이지용 Supabase 쿼리 모음.
 *
 * 모든 함수는 Server Component / Route Handler 전용이며,
 * `createClient()` (server.ts) 로 생성한 서버 클라이언트를 사용한다.
 *
 * 공개 페이지는 RLS 의 anon 정책을 통해 읽기 전용으로 동작한다 —
 * posts 는 is_published = true 만 anon 에게 노출되며,
 * practice_areas / attorneys 는 is_active 필터를 앱 레벨에서 적용한다.
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import type {
  AttorneyWithAreas,
  PostCategory,
  PostWithRelations,
  PracticeArea,
  PracticeAreaWithAttorneys,
  SiteSettings,
} from "@/types/database";

// ────────────────────────────────────────────────
// 변호사
// ────────────────────────────────────────────────

/** 활성 변호사 전체 (display_order 정렬, 담당 업무분야 JOIN) */
export async function getAttorneys(): Promise<AttorneyWithAreas[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attorneys")
    .select(
      `id, name, slug, position, profile_image, bio, intro, career,
       practice_area_cards, display_order, is_active, created_at, updated_at,
       attorney_practice_areas ( practice_areas (id, name, slug) )`
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as AttorneyWithAreas[];
}

/** slug 로 변호사 단건 조회. 없으면 null */
export async function getAttorneyBySlug(
  slug: string
): Promise<AttorneyWithAreas | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("attorneys")
    .select(
      `id, name, slug, position, profile_image, bio, intro, career,
       practice_area_cards, display_order, is_active, created_at, updated_at,
       attorney_practice_areas ( practice_areas (id, name, slug) )`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as AttorneyWithAreas) ?? null;
}

// ────────────────────────────────────────────────
// 업무분야
// ────────────────────────────────────────────────

/** 활성 업무분야 전체 (display_order 정렬) */
export async function getPracticeAreas(): Promise<PracticeArea[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practice_areas")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as PracticeArea[];
}

/** slug 로 업무분야 단건 조회 (담당 변호사 JOIN). 없으면 null */
export async function getPracticeAreaBySlug(
  slug: string
): Promise<PracticeAreaWithAttorneys | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practice_areas")
    .select(
      `*,
       attorney_practice_areas (
         attorneys ( id, name, slug, position, profile_image, intro )
       )`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as PracticeAreaWithAttorneys) ?? null;
}

// ────────────────────────────────────────────────
// 게시글 / 카테고리
// ────────────────────────────────────────────────

/** 게시글 카테고리 전체 (display_order 정렬) */
export async function getPostCategories(): Promise<PostCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PostCategory[];
}

export type GetPostsParams = {
  /** 카테고리 slug (legal-news / case-studies 등). 미지정 시 전체 */
  category?: string;
  /** 1부터 시작 */
  page?: number;
  /** 페이지당 개수. 기본 10 */
  limit?: number;
};

export type GetPostsResult = {
  posts: PostWithRelations[];
  totalCount: number;
};

/**
 * 공개된 게시글 페이지네이션 조회.
 * - is_published = true 만 (RLS anon 에서도 강제)
 * - published_at DESC 정렬
 * - category slug 가 주어지면 post_categories.slug 기준으로 필터
 */
export async function getPosts(
  params: GetPostsParams = {}
): Promise<GetPostsResult> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1) 카테고리 필터가 있으면 category_id 를 먼저 찾는다
  let categoryId: string | null = null;
  if (params.category) {
    const { data: cat, error: catErr } = await supabase
      .from("post_categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    if (catErr) throw catErr;
    // 존재하지 않는 카테고리면 빈 결과 반환
    if (!cat) return { posts: [], totalCount: 0 };
    categoryId = cat.id;
  }

  // 2) 본 쿼리 (count + range)
  let query = supabase
    .from("posts")
    .select(
      `*,
       author:attorneys ( id, name, slug, position, profile_image ),
       category:post_categories ( id, name, slug )`,
      { count: "exact" }
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    posts: (data ?? []) as unknown as PostWithRelations[],
    totalCount: count ?? 0,
  };
}

/** slug 로 공개 게시글 단건 조회. 비공개·미존재 시 null */
export async function getPostBySlug(
  slug: string
): Promise<PostWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `*,
       author:attorneys ( id, name, slug, position, profile_image ),
       category:post_categories ( id, name, slug )`
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as PostWithRelations) ?? null;
}

/** 같은 카테고리 내 관련 글 (현재 글 제외, 최신순) */
export async function getRelatedPosts(
  categoryId: string,
  excludeSlug: string,
  limit: number
): Promise<PostWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `*,
       author:attorneys ( id, name, slug, position, profile_image ),
       category:post_categories ( id, name, slug )`
    )
    .eq("is_published", true)
    .eq("category_id", categoryId)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as PostWithRelations[];
}

/**
 * 조회수를 1 증가시킨다 (fire-and-forget).
 *
 * anon 역할은 posts UPDATE 권한이 없으므로 service_role (admin client) 을
 * 사용한다 — 조회수는 통계용이며 사용자 인증 불필요.
 * 렌더링 지연을 막기 위해 오류는 throw 하지 않고 로깅만 한다.
 *
 * 경합 조건은 허용 (SELECT → UPDATE 2단). 중요 지표가 아니므로 간헐적
 * 누락 허용. 후속 개선 시 Supabase RPC 로 atomic increment 전환 가능.
 */
export async function incrementPostViewCount(slug: string): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data, error: selErr } = await supabase
      .from("posts")
      .select("id, view_count")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (selErr || !data) {
      if (selErr) console.warn("[incrementPostViewCount] select", selErr);
      return;
    }

    const { error: updErr } = await supabase
      .from("posts")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", data.id);

    if (updErr) console.warn("[incrementPostViewCount] update", updErr);
  } catch (err) {
    console.warn("[incrementPostViewCount] unexpected", err);
  }
}

// ────────────────────────────────────────────────
// 사이트 설정
// ────────────────────────────────────────────────

/** 가장 최근 업데이트된 site_settings 1행 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as SiteSettings) ?? null;
}
