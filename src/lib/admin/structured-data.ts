import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { SiteSettings } from "@/types";

export type SchemaStatus = {
  key: string;
  name: string;
  applied: boolean;
  note: string;
  snippet: string;
};

/**
 * 현재 DB 상태 기반 Schema 적용 현황 집계.
 *
 * - Phase 4 에서 실제 JSON-LD 렌더링 예정.
 * - 여기서는 관리자에게 "활성 가능한 상태인지" 만 보고.
 */
export async function getStructuredDataStatus(
  site: SiteSettings | null
): Promise<SchemaStatus[]> {
  const supabase = createAdminClient();

  const [attorneysRes, faqRes, postsRes] = await Promise.all([
    supabase
      .from("attorneys")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("posts")
      .select("id, post_categories!inner(slug)", {
        count: "exact",
        head: true,
      })
      .eq("is_published", true)
      .eq("post_categories.slug", "faq"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  const attorneysCount = attorneysRes.count ?? 0;
  const faqCount = faqRes.count ?? 0;
  const postsCount = postsRes.count ?? 0;
  const hasNap = Boolean(site?.address && site?.phone);

  return [
    {
      key: "LegalService",
      name: "LegalService",
      applied: hasNap && Boolean(site?.firm_name),
      note: hasNap
        ? "사이트 기본 정보 기반 자동 적용"
        : "사무소명/주소/전화 설정 필요",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "LegalService",
          name: site?.firm_name ?? "법무법인 정의",
          address: {
            "@type": "PostalAddress",
            streetAddress: site?.address ?? "-",
          },
          telephone: site?.phone ?? "-",
          email: site?.email ?? undefined,
        },
        null,
        2
      ),
    },
    {
      key: "Attorney",
      name: "Attorney (Person)",
      applied: attorneysCount > 0,
      note:
        attorneysCount > 0
          ? `활성 변호사 ${attorneysCount}명 자동 적용`
          : "활성 변호사 등록 필요",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "홍길동",
          jobTitle: "파트너 변호사",
          worksFor: { "@type": "LegalService", name: site?.firm_name ?? "" },
        },
        null,
        2
      ),
    },
    {
      key: "FAQPage",
      name: "FAQPage",
      applied: faqCount > 0,
      note:
        faqCount > 0
          ? `FAQ 카테고리 공개 게시글 ${faqCount}건 — 자동 생성`
          : "FAQ 카테고리 공개 게시글 필요",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "이혼 소송 기간은?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "일반적으로 6개월~1년 소요됩니다.",
              },
            },
          ],
        },
        null,
        2
      ),
    },
    {
      key: "Article",
      name: "Article",
      applied: postsCount > 0,
      note:
        postsCount > 0
          ? `공개 게시글 ${postsCount}건 — 페이지별 자동 적용`
          : "공개 게시글 필요",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "게시글 제목",
          author: { "@type": "Person", name: "홍길동" },
          datePublished: "2026-04-21",
        },
        null,
        2
      ),
    },
    {
      key: "BreadcrumbList",
      name: "BreadcrumbList",
      applied: true,
      note: "코드 레벨 자동 적용 (모든 depth 페이지)",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "인사이트",
              item: "/insights",
            },
          ],
        },
        null,
        2
      ),
    },
    {
      key: "LocalBusiness",
      name: "LocalBusiness",
      applied: hasNap,
      note: hasNap
        ? "주소/전화 기반 자동 적용"
        : "주소/전화 설정 필요",
      snippet: JSON.stringify(
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: site?.firm_name ?? "",
          address: {
            "@type": "PostalAddress",
            streetAddress: site?.address ?? "",
          },
          telephone: site?.phone ?? "",
          openingHours: site?.business_hours?.weekday ?? "",
        },
        null,
        2
      ),
    },
  ];
}
