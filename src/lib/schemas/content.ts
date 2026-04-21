import { z } from "zod";

/**
 * 콘텐츠 관리(STEP 6) — 게시글/변호사/업무분야 저장용 입력 스키마.
 * Server Actions 에서 검증 후 DB 에 전달.
 */

// ─── 게시글 ────────────────────────────────────────────────

export const postInputSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(200),
  slug: z.string().min(1, "슬러그를 입력해주세요").max(200),
  category_id: z.string().uuid().nullable(),
  content: z.string().default(""),
  excerpt: z.string().max(300).nullable().default(null),
  thumbnail: z.string().url().nullable().default(null),
  og_image: z.string().url().nullable().default(null),
  tags: z.array(z.string().min(1)).max(20).default([]),
  author_id: z.string().uuid().nullable(),
  is_published: z.boolean().default(false),
  published_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD")
    .nullable()
    .default(null),
  meta_title: z.string().max(60).nullable().default(null),
  meta_description: z.string().max(160).nullable().default(null),
});

export type PostInput = z.infer<typeof postInputSchema>;

// ─── 변호사 ────────────────────────────────────────────────

const careerItemSchema = z.object({
  year: z.string().min(1).max(20),
  content: z.string().min(1).max(200),
});

const availableSlotInputSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM 형식"),
});

export const attorneyInputSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50),
  slug: z.string().min(1, "슬러그를 입력해주세요").max(100),
  position: z.string().max(50).nullable().default(null),
  profile_image: z.string().url().nullable().default(null),
  bio: z.string().max(500).nullable().default(null),
  career: z.array(careerItemSchema).max(30).default([]),
  is_active: z.boolean().default(true),
  practice_area_ids: z.array(z.string().uuid()).default([]),
  available_slots: z.array(availableSlotInputSchema).default([]),
});

export type AttorneyInput = z.infer<typeof attorneyInputSchema>;

// ─── 업무분야 ──────────────────────────────────────────────

export const practiceAreaInputSchema = z.object({
  name: z.string().min(1, "분야명을 입력해주세요").max(50),
  slug: z.string().min(1, "슬러그를 입력해주세요").max(100),
  description: z.string().max(300).nullable().default(null),
  detail_content: z.string().nullable().default(null),
  icon_name: z.string().max(50).nullable().default(null),
  is_active: z.boolean().default(true),
  meta_title: z.string().max(60).nullable().default(null),
  meta_description: z.string().max(160).nullable().default(null),
});

export type PracticeAreaInput = z.infer<typeof practiceAreaInputSchema>;

// ─── Server Action 응답 공통 ────────────────────────────────

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
