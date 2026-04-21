import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildFaqPageSchema } from "@/lib/schema";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InsightFilterTabs } from "@/components/sections/InsightFilterTabs";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { formatDateLocaleKo } from "@/lib/utils/date";
import { INSIGHTS } from "@/constants/dummy";
import { cn } from "@/lib/utils/cn";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "insights",
    path: "/insights",
    fallback: {
      title: "법률정보",
      description:
        "법률 뉴스, 상담 사례, 법률 용어, FAQ 등 유용한 법률 정보를 제공합니다.",
    },
  });
}

const ITEMS_PER_PAGE = 7; // 1 featured + 6 grid

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function buildHref(category: string, page: number) {
  const params = new URLSearchParams();
  if (category !== "전체") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/insights?${qs}` : "/insights";
}

export default async function InsightsPage({ searchParams }: Props) {
  const { category = "전체", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10));

  const filtered =
    category === "전체"
      ? INSIGHTS
      : INSIGHTS.filter((item) => item.category === category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const offset = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(offset, offset + ITEMS_PER_PAGE);
  const [featured, ...gridItems] = pageItems;

  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "법률정보" },
  ];

  // AEO: FAQ 필터일 때만 FAQPage 스키마 주입 (스팸 방지)
  const isFaqCategory = category.toUpperCase() === "FAQ";
  const faqSchema =
    isFaqCategory && filtered.length > 0
      ? buildFaqPageSchema(
          filtered.map((item) => ({
            question: item.title,
            answer: item.excerpt,
          }))
        )
      : null;

  return (
    <main>
      {faqSchema && <JsonLd data={faqSchema} id="schema-faq" />}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="법률정보"
        subtitle="법률 전문가가 직접 작성한 믿을 수 있는 법률 정보를 확인하세요."
      />

      <section className="py-12 md:py-16 bg-bg-white">
        <div className="container-content">
          {/* 카테고리 필터 탭 */}
          <InsightFilterTabs activeCategory={category} />

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-body text-text-sub">
              해당 카테고리의 게시글이 없습니다.
            </p>
          ) : (
            <>
              {/* Featured 게시글 */}
              {featured && (
                <Link
                  href={`/insights/${featured.slug}`}
                  className="group block mt-10"
                  aria-label={`${featured.title} 자세히 보기`}
                >
                  <Card
                    hover
                    padding="none"
                    className="grid grid-cols-1 md:grid-cols-2 overflow-hidden"
                  >
                    {/* 썸네일 */}
                    <div className="aspect-video md:aspect-auto md:min-h-[280px] bg-primary/10 flex items-center justify-center">
                      <span className="text-h1 font-bold text-primary/20">
                        {featured.title[0]}
                      </span>
                    </div>
                    {/* 내용 */}
                    <div className="flex flex-col justify-center p-8 md:p-10">
                      <Badge variant="category">{featured.category}</Badge>
                      <h2 className="mt-3 text-h3 font-bold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {featured.title}
                      </h2>
                      <p className="mt-2 text-body text-text-sub line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-caption text-text-sub">
                        {featured.readingTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" aria-hidden />
                            {featured.readingTime}분 읽기
                          </span>
                        )}
                        <span>{formatDateLocaleKo(featured.publishedAt)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}

              {/* 3컬럼 그리드 */}
              {gridItems.length > 0 && (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {gridItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/insights/${item.slug}`}
                      className="group block"
                      aria-label={`${item.title} 자세히 보기`}
                    >
                      <Card hover className="h-full flex flex-col" padding="none">
                        {/* 썸네일 */}
                        <div className="aspect-video bg-primary/10 flex items-center justify-center overflow-hidden">
                          <span className="text-h2 font-bold text-primary/20">
                            {item.title[0]}
                          </span>
                        </div>
                        {/* 내용 */}
                        <div className="flex flex-col flex-1 p-5">
                          <Badge variant="category" className="self-start">
                            {item.category}
                          </Badge>
                          <h3 className="mt-2 text-body font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 text-caption text-text-sub line-clamp-2 flex-1">
                            {item.excerpt}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-caption text-text-sub">
                            {item.readingTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" aria-hidden />
                                {item.readingTime}분
                              </span>
                            )}
                            <span>{formatDateLocaleKo(item.publishedAt)}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="페이지 이동"
                  className="mt-12 flex items-center justify-center gap-1"
                >
                  <Link
                    href={buildHref(category, safeCurrentPage - 1)}
                    aria-label="이전 페이지"
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 text-text-sub hover:text-primary hover:bg-bg-light transition-colors",
                      safeCurrentPage === 1 && "pointer-events-none opacity-30"
                    )}
                    tabIndex={safeCurrentPage === 1 ? -1 : 0}
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </Link>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Link
                        key={p}
                        href={buildHref(category, p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === safeCurrentPage ? "page" : undefined}
                        className={cn(
                          "inline-flex items-center justify-center w-10 h-10 text-body transition-colors",
                          p === safeCurrentPage
                            ? "bg-primary text-bg-white font-semibold"
                            : "text-text-sub hover:text-primary hover:bg-bg-light"
                        )}
                      >
                        {p}
                      </Link>
                    )
                  )}

                  <Link
                    href={buildHref(category, safeCurrentPage + 1)}
                    aria-label="다음 페이지"
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 text-text-sub hover:text-primary hover:bg-bg-light transition-colors",
                      safeCurrentPage === totalPages &&
                        "pointer-events-none opacity-30"
                    )}
                    tabIndex={safeCurrentPage === totalPages ? -1 : 0}
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </Link>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
