/**
 * JSON-LD 구조화 데이터 생성 함수 (PRD §7 AEO)
 *
 * 모든 Schema 는 SITE 상수를 기본 source of truth 로 사용한다.
 * 추후 Supabase site_settings DB 값이 생기면 이 모듈에서만 fallback 체인을 확장하면 된다
 * — 호출부는 변경 없이 유지되도록 설계.
 */
import { SITE } from "@/constants/site";
import type {
  ArticleSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  LegalServiceSchema,
  PersonSchema,
  PostalAddress,
  ServiceSchema,
} from "@/types/schema";

const SCHEMA_CONTEXT = "https://schema.org" as const;

/** 상대경로를 NEXT_PUBLIC_SITE_URL 기반 절대 URL 로 정규화 */
export function absoluteUrl(path: string = "/"): string {
  const base = SITE.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** NAP 상수를 schema.org PostalAddress 로 변환 */
export function resolvePostalAddress(): PostalAddress {
  return {
    "@type": "PostalAddress",
    streetAddress: SITE.nap.address,
    addressLocality: SITE.nap.addressLocality,
    addressRegion: SITE.nap.addressRegion,
    postalCode: SITE.nap.postalCode,
    addressCountry: "KR",
  };
}

// ─────────────────────────────────────────────
// 1. LegalService (+ LocalBusiness hybrid)
// ─────────────────────────────────────────────
export function buildLegalServiceSchema(): LegalServiceSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "LegalService",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.nap.phone,
    email: SITE.nap.email,
    address: resolvePostalAddress(),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "13:00",
      },
    ],
    priceRange: "무료 초기 상담",
    areaServed: { "@type": "City", name: "서울" },
  };
}

// ─────────────────────────────────────────────
// 2. Person (Attorney)
// ─────────────────────────────────────────────
export interface AttorneySchemaInput {
  slug: string;
  name: string;
  position: string;
  specialties?: string[];
  intro?: string;
  bio?: string;
  image?: string;
}

export function buildPersonSchema(input: AttorneySchemaInput): PersonSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Person",
    name: input.name,
    jobTitle: input.position,
    description: input.intro ?? input.bio,
    worksFor: { "@type": "LegalService", name: SITE.name },
    knowsAbout: input.specialties,
    image: input.image,
    url: absoluteUrl(`/attorneys/${input.slug}`),
  };
}

// ─────────────────────────────────────────────
// 3. FAQPage
// ─────────────────────────────────────────────
export interface FaqSchemaItem {
  question: string;
  answer: string;
}

export function buildFaqPageSchema(items: FaqSchemaItem[]): FAQPageSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

// ─────────────────────────────────────────────
// 4. Article
// ─────────────────────────────────────────────
export interface ArticleSchemaInput {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  authorSlug?: string;
  image?: string;
}

export function buildArticleSchema(input: ArticleSchemaInput): ArticleSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: input.title,
    description: input.excerpt,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: {
      "@type": "Person",
      name: input.authorName,
      url: input.authorSlug
        ? absoluteUrl(`/attorneys/${input.authorSlug}`)
        : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
    },
    image: input.image,
    mainEntityOfPage: absoluteUrl(`/insights/${input.slug}`),
  };
}

// ─────────────────────────────────────────────
// 5. BreadcrumbList
// ─────────────────────────────────────────────
export interface BreadcrumbSchemaItem {
  label: string;
  href?: string;
}

export function buildBreadcrumbListSchema(
  items: BreadcrumbSchemaItem[]
): BreadcrumbListSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: item.href ? absoluteUrl(item.href) : undefined,
    })),
  };
}

// ─────────────────────────────────────────────
// 6. Service (업무분야)
// ─────────────────────────────────────────────
export interface ServiceSchemaInput {
  name: string;
  description: string;
}

export function buildServiceSchema(input: ServiceSchemaInput): ServiceSchema {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "LegalService",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: { "@type": "City", name: "서울" },
    serviceType: input.name,
  };
}
