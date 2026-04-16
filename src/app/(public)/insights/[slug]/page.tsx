import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import {
  getPostBySlug,
  getPosts,
  getRelatedPosts,
  incrementPostViewCount,
} from "@/lib/supabase/queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPostBySlug(slug);
  if (!article) return {};
  const title = article.meta_title ?? article.title;
  const description = article.meta_description ?? article.excerpt ?? undefined;
  return {
    title,
    description,
    openGraph: { title, description },
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
  const article = await getPostBySlug(slug);
  if (!article) notFound();

  // 조회수 증가 — fire-and-forget (렌더링 지연 방지)
  void incrementPostViewCount(slug);

  const [relatedArticles, { posts: bottomRelatedPool }] = await Promise.all([
    article.category_id
      ? getRelatedPosts(article.category_id, slug, 3)
      : Promise.resolve([]),
    getPosts({ limit: 4 }),
  ]);

  // 하단 관련 4건 중 현재 글 제외 후 3건
  const bottomRelated = bottomRelatedPool
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const author = article.author;

  return (
    <main>
      {/* ── 헤더 영역 ── */}
      <section className="bg-bg-white border-b border-bg-light py-12 md:py-16">
        <div className="container-content max-w-[1080px]">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "법률정보", href: "/insights" },
              ...(article.category
                ? [
                    {
                      label: article.category.name,
                      href: `/insights?category=${encodeURIComponent(article.category.slug)}`,
                    },
                  ]
                : []),
              { label: article.title },
            ]}
          />

          <div className="mt-6 flex items-center gap-2 flex-wrap">
            {article.category && (
              <Badge variant="category">{article.category.name}</Badge>
            )}
            {article.published_at && (
              <span className="text-caption text-text-sub flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" aria-hidden />
                {formatDate(article.published_at)}
              </span>
            )}
            {article.reading_time && (
              <span className="text-caption text-text-sub flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                {article.reading_time}분 읽기
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
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* 태그 */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-bg-light">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag
                      className="w-4 h-4 text-text-sub shrink-0"
                      aria-hidden
                    />
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
                  <h2 className="text-body font-semibold text-primary">목차</h2>
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
                          {rel.published_at && (
                            <p className="mt-0.5 text-caption text-text-sub">
                              {formatDate(rel.published_at)}
                            </p>
                          )}
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
                      {item.category && (
                        <Badge variant="category" className="self-start">
                          {item.category.name}
                        </Badge>
                      )}
                      <h3 className="mt-2 text-body font-semibold text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                        {item.title}
                      </h3>
                      {item.excerpt && (
                        <p className="mt-1 text-caption text-text-sub flex-1 line-clamp-2">
                          {item.excerpt}
                        </p>
                      )}
                      {item.published_at && (
                        <p className="mt-3 text-caption text-text-sub">
                          {formatDate(item.published_at)}
                        </p>
                      )}
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
