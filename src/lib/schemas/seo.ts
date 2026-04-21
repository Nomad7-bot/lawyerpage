import { z } from "zod";

/**
 * SEO / site_settings 입력 스키마 — Server Actions 파일과 분리.
 * ("use server" 파일은 async function 만 export 허용)
 */

export const seoUpdateSchema = z.object({
  meta_title: z.string().max(60).nullable(),
  meta_description: z.string().max(160).nullable(),
  og_title: z.string().max(60).nullable(),
  og_description: z.string().max(200).nullable(),
  og_image: z.string().url().nullable(),
  canonical_url: z.string().max(200).nullable(),
});

export type SeoUpdateInput = z.infer<typeof seoUpdateSchema>;

export const siteSettingsInputSchema = z.object({
  firm_name: z.string().min(1, "사무소명을 입력해주세요").max(100),
  address: z.string().min(1, "주소를 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요").max(20),
  fax: z.string().max(20).nullable(),
  email: z.string().email("올바른 이메일").nullable(),
  business_hours: z
    .object({
      weekday: z.string(),
      saturday: z.string(),
      sunday: z.string(),
      holiday: z.string(),
    })
    .partial()
    .refine((v) => Object.keys(v).length > 0, "영업시간을 입력해주세요"),
  blog_url: z.string().url("올바른 URL").nullable(),
  instagram_url: z.string().url("올바른 URL").nullable(),
  default_title_template: z.string().max(100).nullable(),
  default_description: z.string().nullable(),
  default_og_image: z.string().url().nullable(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
