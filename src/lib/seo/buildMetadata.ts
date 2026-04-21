import type { Metadata } from "next";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/lib/schema";
import { getSeoSettings, type SeoSettingsRow } from "@/lib/seo/getSeoSettings";
import { getSiteSettings } from "@/lib/seo/getSiteSettings";

/**
 * 페이지 metadata 를 4단 fallback 으로 조립한다 (PRD §7 SEO).
 *
 *   ① seo_settings(page_name)   — 관리자 CMS 오버라이드
 *   ② dbRow.meta_*              — 상세 페이지 개별 SEO (posts/practice_areas 등)
 *   ③ fallback.* 인자            — 더미 데이터 / 자동 생성 파생
 *   ④ site_settings + SITE 상수  — 최후 안전망
 *
 * 반환값은 Next.js `Metadata` — `title.template` 이 루트 layout 에서
 * 자동 합성되므로 `title` 은 보통 문자열로 충분하다. 동일한 이유로
 * `openGraph.url` 은 `metadataBase` + `alternates.canonical` 이 대체하므로 생략.
 */
export interface BuildMetadataInput {
  /** seo_settings.page_name 식별자 (예: 'home', 'attorney-detail') */
  pageName: string;
  /** canonical 경로 (예: '/', '/attorneys/kim-daepyo') */
  path: string;
  /** 상세 페이지 DB row 의 meta_*, og_image (posts/practice_areas 등) */
  dbRow?: {
    meta_title?: string | null;
    meta_description?: string | null;
    og_image?: string | null;
  } | null;
  /** 더미 또는 자동 생성 파생 fallback */
  fallback?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

export async function buildMetadata(
  input: BuildMetadataInput
): Promise<Metadata> {
  const [seo, siteRow] = await Promise.all([
    getSeoSettings(input.pageName),
    getSiteSettings(),
  ]);

  const rawTitle = resolveTitle(seo, input.dbRow, input.fallback?.title);
  const description = resolveDescription(
    seo,
    input.dbRow,
    input.fallback?.description,
    siteRow?.default_description
  );
  const ogImage = resolveOgImage(
    seo,
    input.dbRow,
    input.fallback?.ogImage,
    siteRow?.default_og_image
  );

  // 루트 layout 의 title.template 이 nested generateMetadata 체인에서 일관되게
  // 적용되지 않는 Next.js 15 behavior 때문에, 여기서 절대값으로 직접 조립한다.
  // 홈("/")은 사이트명만 그대로 노출해 "법률사무소 | 법률사무소" 중복 방지.
  const fullTitle =
    input.path === "/" || rawTitle === SITE.name
      ? rawTitle
      : `${rawTitle} | ${SITE.name}`;

  const canonical = absoluteUrl(input.path);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    openGraph: {
      // 루트 layout 의 openGraph 필드가 자식 generateMetadata 에서 전체 교체되므로
      // 여기서 type/locale/siteName/url 을 명시해 SEO 일관성 확보
      type: "website",
      locale: "ko_KR",
      siteName: SITE.name,
      url: canonical,
      title: seo?.og_title ?? fullTitle,
      description: seo?.og_description ?? description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

function resolveTitle(
  seo: SeoSettingsRow | null,
  dbRow: BuildMetadataInput["dbRow"],
  fallback: string | undefined
): string {
  return (
    seo?.meta_title ??
    dbRow?.meta_title ??
    fallback ??
    SITE.name
  );
}

function resolveDescription(
  seo: SeoSettingsRow | null,
  dbRow: BuildMetadataInput["dbRow"],
  fallback: string | undefined,
  siteDefault: string | null | undefined
): string {
  return (
    seo?.meta_description ??
    dbRow?.meta_description ??
    fallback ??
    siteDefault ??
    SITE.description
  );
}

function resolveOgImage(
  seo: SeoSettingsRow | null,
  dbRow: BuildMetadataInput["dbRow"],
  fallback: string | undefined,
  siteDefault: string | null | undefined
): string | undefined {
  return (
    seo?.og_image ??
    dbRow?.og_image ??
    fallback ??
    siteDefault ??
    undefined
  );
}
