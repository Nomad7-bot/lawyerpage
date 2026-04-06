import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import { INSIGHTS_DETAIL, INSIGHTS, ATTORNEYS_DETAIL } from "@/constants/dummy";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = INSIGHTS_DETAIL[slug];
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = INSIGHTS_DETAIL[slug];
  if (!article) notFound();

  const author = ATTORNEYS_DETAIL[article.authorSlug];

  // 같은 카테고리에서 관련 글 3건 (현재 글 제외)
  const relatedArticles = INSIGHTS.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  ).slice(0, 3);

  // 하단 관련 법률정보 3건 (카테고리 무관, 최신순)
  const bottomRelated = INSIGHTS.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <main>
      {/* ── 헤더 영역 ── */}
      <section className="bg-bg-white border-b border-bg-light py-12 md:py-16">
        <div className="container-content max-w-[1080px]">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "법률정보", href: "/insights" },
              { label: article.category, href: `/insights?category=${encodeURIComponent(article.category)}` },
              { label: article.title },
            ]}
          />

          <div className="mt-6 flex items-center gap-2">
            <Badge variant="category">{article.category}</Badge>
            <span className="text-caption text-text-sub flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" aria-hidden />
              {formatDate(article.publishedAt)}
            </span>
            {article.readingTime && (
              <span className="text-caption text-text-sub flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                {article.readingTime}분 읽기
              </span>
            )}
          </div>

          <h1 className="mt-5 text-h2 font-bold text-primary md:text-[36px] md:leading-tight">
            {article.title}
          </h1>

          {/* 작성자 정보 */}
          {author && (
            <Link
              href={`/attorneys/${author.slug}`}
              className="mt-6 inline-flex items-center gap-3 group"
              aria-label={`${author.name} 변호사 프로필 보기`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-body font-bold text-primary/40">
                  {author.name[0]}
                </span>
              </div>
              <div>
                <p className="text-body font-semibold text-primary group-hover:text-primary-light transition-colors">
                  {author.name} {author.position}
                </p>
                <p className="text-caption text-accent">
                  {author.specialties.join(" · ")}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ── 본문 + 사이드바 ── */}
      <section className="py-12 md:py-16 bg-bg-white">
        <div className="container-content max-w-[1080px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
            {/* 본문 */}
            <article>
              <div
                className="article-body"
                dangerouslySetInnerHTML={{ __html: article.body }}
              />

              {/* 태그 */}
              {article.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-bg-light">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-text-sub shrink-0" aria-hidden />
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="tag">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* 사이드바 (Desktop only sticky) */}
            <aside className="space-y-6 lg:sticky lg:top-24 self-start">
              {/* 목차 (TOC) */}
              {article.toc.length > 0 && (
                <Card padding="md">
                  <h2 className="text-body font-semibold text-primary">
                    목차
                  </h2>
                  <div className="mt-2 h-0.5 w-6 bg-accent" aria-hidden />
                  <nav aria-label="본문 목차">
                    <ol className="mt-3 space-y-2">
                      {article.toc.map((item, idx) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="flex items-start gap-2 text-caption text-text-sub hover:text-primary transition-colors"
                          >
                            <span className="text-accent font-semibold shrink-0">
                              {idx + 1}.
                            </span>
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </Card>
              )}

              {/* 관련 글 */}
              {relatedArticles.length > 0 && (
                <Card padding="md">
                  <h2 className="text-body font-semibold text-primary">
                    관련 법률정보
                  </h2>
                  <div className="mt-2 h-0.5 w-6 bg-accent" aria-hidden />
                  <ul className="mt-3 space-y-3">
                    {relatedArticles.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`/insights/${rel.slug}`}
                          className="group block"
                        >
                          <p className="text-caption font-medium text-primary group-hover:text-primary-light transition-colors line-clamp-2">
                            {rel.title}
                          </p>
                          <p className="mt-0.5 text-caption text-text-sub">
                            {formatDate(rel.publishedAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* 상담 CTA 카드 */}
              <div className="bg-primary rounded-card p-6">
                <p className="text-body font-semibold text-bg-white">
                  관련 법률 문제로 어려움을 겪고 계신가요?
                </p>
                <p className="mt-2 text-caption text-bg-white/70">
                  전문 변호사와 1:1 상담으로 명쾌한 해결책을 찾아드립니다.
                </p>
                <Link
                  href="/reservation"
                  className={buttonStyles({
                    variant: "cta",
                    size: "md",
                    fullWidth: true,
                    className: "mt-4",
                  })}
                >
                  무료 상담 예약
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 하단: 관련 법률정보 3건 ── */}
      {bottomRelated.length > 0 && (
        <section className="py-12 md:py-16 bg-bg-light">
          <div className="container-content">
            <h2 className="text-h3 font-semibold text-primary">
              함께 읽으면 좋은 글
            </h2>
            <div className="mt-2 h-0.5 w-12 bg-accent" aria-hidden />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {bottomRelated.map((item) => (
                <Link
                  key={item.slug}
                  href={`/insights/${item.slug}`}
                  className="group block"
                  aria-label={`${item.title} 읽기`}
                >
                  <Card hover className="h-full flex flex-col" padding="none">
                    <div className="aspect-video bg-primary/10 flex items-center justify-center">
                      <span className="text-h2 font-bold text-primary/20">
                        {item.title[0]}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <Badge variant="category" className="self-start">
                        {item.category}
                      </Badge>
                      <h3 className="mt-2 text-body font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-caption text-text-sub flex-1 line-clamp-2">
                        {item.excerpt}
                      </p>
                      <p className="mt-3 text-caption text-text-sub">
                        {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
