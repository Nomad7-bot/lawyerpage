import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { InsightFilterTabs } from "@/components/sections/InsightFilterTabs";
import { getPostCategories, getPosts } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "법률정보",
  description:
    "법률 뉴스, 상담 사례, 법률 용어, FAQ 등 유용한 법률 정보를 제공합니다.",
  openGraph: {
    title: "법률정보",
    description: "법률 전문가가 작성한 신뢰할 수 있는 법률 정보.",
  },
};

const ITEMS_PER_PAGE = 7; // 1 featured + 6 grid

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

function buildHref(categorySlug: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/insights?${qs}` : "/insights";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function InsightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categorySlug = sp.category;
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ posts, totalCount }, categories] = await Promise.all([
    getPosts({
      category: categorySlug,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }),
    getPostCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const [featured, ...gridItems] = posts;

  return (
    <main>
      {/* Page Header Banner */}
      <section className="bg-primary flex flex-col justify-center min-h-[320px]">
        <div className="container-content py-12">
          <Breadcrumb
            items={[{ label: "홈", href: "/" }, { label: "법률정보" }]}
            variant="dark"
          />
          <h1 className="mt-6 text-h1 font-bold text-bg-white">법률정보</h1>
          <p className="mt-3 text-body text-bg-white/70">
            법률 전문가가 직접 작성한 믿을 수 있는 법률 정보를 확인하세요.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-bg-white">
        <div className="container-content">
          {/* 카테고리 필터 탭 */}
          <InsightFilterTabs
            categories={categories}
            activeSlug={categorySlug}
          />

          {posts.length === 0 ? (
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
                      {featured.category && (
                        <Badge variant="category">
                          {featured.category.name}
                        </Badge>
                      )}
                      <h2 className="mt-3 text-h3 font-bold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="mt-2 text-body text-text-sub line-clamp-3">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-3 text-caption text-text-sub">
                        {featured.reading_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" aria-hidden />
                            {featured.reading_time}분 읽기
                          </span>
                        )}
                        {featured.published_at && (
                          <span>{formatDate(featured.published_at)}</span>
                        )}
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
                      <Card
                        hover
                        className="h-full flex flex-col"
                        padding="none"
                      >
                        {/* 썸네일 */}
                        <div className="aspect-video bg-primary/10 flex items-center justify-center overflow-hidden">
                          <span className="text-h2 font-bold text-primary/20">
                            {item.title[0]}
                          </span>
                        </div>
                        {/* 내용 */}
                        <div className="flex flex-col flex-1 p-5">
                          {item.category && (
                            <Badge variant="category" className="self-start">
                              {item.category.name}
                            </Badge>
                          )}
                          <h3 className="mt-2 text-body font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                            {item.title}
                          </h3>
                          {item.excerpt && (
                            <p className="mt-1.5 text-caption text-text-sub line-clamp-2 flex-1">
                              {item.excerpt}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-2 text-caption text-text-sub">
                            {item.reading_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" aria-hidden />
                                {item.reading_time}분
                              </span>
                            )}
                            {item.published_at && (
                              <span>{formatDate(item.published_at)}</span>
                            )}
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
                    href={buildHref(categorySlug, safeCurrentPage - 1)}
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
                        href={buildHref(categorySlug, p)}
                        aria-label={`${p}페이지`}
                        aria-current={
                          p === safeCurrentPage ? "page" : undefined
                        }
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
                    href={buildHref(categorySlug, safeCurrentPage + 1)}
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
