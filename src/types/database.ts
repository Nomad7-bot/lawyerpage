/**
 * 공개 페이지 컨텐츠 도메인 타입
 * Supabase 테이블 스키마(마이그레이션 001 + 004)와 1:1 대응.
 * 컬럼명은 DB와 동일하게 snake_case 유지.
 */

// ────────────────────────────────────────────────
// 1. 기본 행 타입 (테이블과 1:1)
// ────────────────────────────────────────────────

export type PostCategory = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
};

export type PracticeArea = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detail_content: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  key_services: string[];
  related_cases: RelatedCase[];
  created_at: string;
  updated_at: string;
};

export type RelatedCase = {
  id: string;
  title: string;
  desc: string;
  result: string;
};

export type Attorney = {
  id: string;
  name: string;
  slug: string;
  position: string;
  profile_image: string | null;
  bio: string | null;
  intro: string | null;
  career: CareerEntry[];
  practice_area_cards: PracticeAreaCard[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * 변호사 경력 항목.
 * 실제 저장된 JSONB 는 { year, title, desc } 형식이지만,
 * 스키마 초안(001)의 주석은 { year, content } 를 전제로 했기에
 * 두 형식을 모두 허용한다 — 렌더링 시 title/desc 우선, 없으면 content 사용.
 */
export type CareerEntry = {
  year: string;
  title?: string;
  desc?: string;
  content?: string;
};

export type PracticeAreaCard = {
  icon_name: string;
  title: string;
  desc: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  tags: string[] | null;
  author_id: string | null;
  category_id: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  reading_time: number | null;
  toc: TocEntry[];
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

export type TocEntry = {
  id: string;
  title: string;
};

export type SiteSettings = {
  id: string;
  firm_name: string;
  address: string;
  postal_code: string | null;
  address_region: string | null;
  address_locality: string | null;
  phone: string;
  phone_display: string | null;
  fax: string | null;
  email: string | null;
  business_hours: BusinessHours;
  blog_url: string | null;
  instagram_url: string | null;
  default_title_template: string | null;
  default_description: string | null;
  default_og_image: string | null;
  updated_at: string;
};

export type BusinessHours = {
  weekday?: string;
  saturday?: string;
  sunday?: string;
};

// ────────────────────────────────────────────────
// 2. JOIN 결과 타입
// ────────────────────────────────────────────────

/** 변호사 + 담당 업무분야 (attorney_practice_areas JOIN) */
export type AttorneyWithAreas = Attorney & {
  attorney_practice_areas: Array<{
    practice_areas: Pick<PracticeArea, "id" | "name" | "slug"> | null;
  }>;
};

/** 업무분야 + 담당 변호사 (attorney_practice_areas 역방향 JOIN) */
export type PracticeAreaWithAttorneys = PracticeArea & {
  attorney_practice_areas: Array<{
    attorneys: Pick<
      Attorney,
      "id" | "name" | "slug" | "position" | "profile_image" | "intro"
    > | null;
  }>;
};

/** 게시글 + 작성자 + 카테고리 */
export type PostWithRelations = Post & {
  author: Pick<
    Attorney,
    "id" | "name" | "slug" | "position" | "profile_image"
  > | null;
  category: Pick<PostCategory, "id" | "name" | "slug"> | null;
};
