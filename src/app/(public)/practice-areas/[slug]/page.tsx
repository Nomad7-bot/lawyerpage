import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { buttonStyles } from "@/components/ui/Button";
import {
  getPracticeAreaBySlug,
  getPracticeAreas,
} from "@/lib/supabase/queries";
import { getIcon } from "@/lib/utils/iconMap";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = await getPracticeAreaBySlug(slug);
  if (!area) return {};
  return {
    title: area.meta_title ?? area.name,
    description: area.meta_description ?? area.description ?? undefined,
    openGraph: {
      title: area.meta_title ?? area.name,
      description: area.meta_description ?? area.description ?? undefined,
    },
  };
}

export default async function PracticeAreaDetailPage({ params }: Props) {
  const { slug } = await params;
  const [area, allAreas] = await Promise.all([
    getPracticeAreaBySlug(slug),
    getPracticeAreas(),
  ]);

  if (!area) notFound();

  const Icon = getIcon(area.icon_name);
  const attorneys = area.attorney_practice_areas
    .map((rel) => rel.attorneys)
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const relatedAreas = allAreas.filter((a) => a.slug !== slug).slice(0, 5);

  return (
    <main>
      {/* Page Header Banner */}
      <section className="bg-primary flex flex-col justify-center min-h-[280px]">
        <div className="container-content py-12">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "업무분야", href: "/practice-areas" },
              { label: area.name },
            ]}
            variant="dark"
          />
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-bg-white/10 rounded-card shrink-0">
              <Icon className="w-8 h-8 text-accent" aria-hidden />
            </div>
            <h1 className="text-h1 font-bold text-bg-white">{area.name}</h1>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <section className="py-16 md:py-22 bg-bg-white">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
            {/* ── 왼쪽: 본문 ── */}
            <div className="md:col-span-8 space-y-12">
              {/* 업무 소개 */}
              {area.detail_content && (
                <div>
                  <h2 className="text-h3 font-semibold text-primary">
                    업무 소개
                  </h2>
                  <div className="mt-3 h-0.5 w-12 bg-accent" aria-hidden />
                  <p className="mt-5 text-body text-text-main whitespace-pre-line">
                    {area.detail_content}
                  </p>
                </div>
              )}

              {/* 주요 업무 범위 */}
              {area.key_services.length > 0 && (
                <div>
                  <h2 className="text-h3 font-semibold text-primary">
                    주요 업무 범위
                  </h2>
                  <div className="mt-3 h-0.5 w-12 bg-accent" aria-hidden />
                  <ul className="mt-5 space-y-3">
                    {area.key_services.map((service) => (
                      <li key={service} className="flex items-start gap-3">
                        <CheckCircle
                          className="w-5 h-5 text-accent shrink-0 mt-0.5"
                          aria-hidden
                        />
                        <span className="text-body text-text-main">
                          {service}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 관련 사례 */}
              {area.related_cases.length > 0 && (
                <div>
                  <h2 className="text-h3 font-semibold text-primary">
                    관련 사례
                  </h2>
                  <div className="mt-3 h-0.5 w-12 bg-accent" aria-hidden />
                  <div className="mt-5 space-y-4">
                    {area.related_cases.map((c) => (
                      <Card key={c.id} className="bg-bg-light">
                        <span className="text-caption font-bold text-accent tracking-widest">
                          CASE {c.id}
                        </span>
                        <h3 className="mt-2 text-h4 font-semibold text-primary">
                          {c.title}
                        </h3>
                        <p className="mt-2 text-body text-text-sub">{c.desc}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-caption text-text-sub">
                            판결 결과
                          </span>
                          <span className="text-caption font-semibold text-primary">
                            {c.result}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 오른쪽: 사이드바 ── */}
            <aside className="md:col-span-4">
              <div className="space-y-6 md:sticky md:top-24">
                {/* 담당 변호사 */}
                {attorneys.length > 0 && (
                  <Card padding="md">
                    <h3 className="text-h4 font-semibold text-primary">
                      담당 변호사
                    </h3>
                    <div className="mt-2 h-0.5 w-8 bg-accent" aria-hidden />
                    <div className="mt-4 space-y-4">
                      {attorneys.map((attorney) => (
                        <Link
                          key={attorney.slug}
                          href={`/attorneys/${attorney.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          {/* 아바타 */}
                          <div
                            className="w-12 h-12 rounded-full bg-bg-light flex items-center justify-center shrink-0"
                            aria-hidden
                          >
                            <span className="text-h4 font-bold text-primary">
                              {attorney.name[0]}
                            </span>
                          </div>
                          {/* 정보 */}
                          <div>
                            <p className="text-body font-semibold text-primary group-hover:text-primary-light transition-colors">
                              {attorney.name}
                            </p>
                            <p className="text-caption text-text-sub">
                              {attorney.position}
                            </p>
                            {attorney.intro && (
                              <p className="mt-0.5 text-caption text-accent line-clamp-1">
                                {attorney.intro}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 상담 예약 CTA */}
                <div className="bg-primary rounded-card p-6">
                  <p className="text-body font-semibold text-bg-white">
                    {area.name} 분야 전문 상담이 필요하십니까?
                  </p>
                  <p className="mt-2 text-caption text-bg-white/70">
                    전문 변호사와 1:1 상담으로 최선의 해결책을 찾아드립니다.
                  </p>
                  <Link
                    href="/reservation"
                    className={buttonStyles({
                      variant: "cta",
                      size: "md",
                      fullWidth: true,
                      className: "mt-5",
                    })}
                  >
                    지금 상담 예약하기
                  </Link>
                </div>

                {/* 다른 업무분야 */}
                <Card padding="md">
                  <h3 className="text-h4 font-semibold text-primary">
                    다른 업무분야
                  </h3>
                  <div className="mt-2 h-0.5 w-8 bg-accent" aria-hidden />
                  <ul className="mt-4 divide-y divide-bg-light">
                    {relatedAreas.map((related) => {
                      const RelatedIcon = getIcon(related.icon_name);
                      return (
                        <li key={related.slug}>
                          <Link
                            href={`/practice-areas/${related.slug}`}
                            className="flex items-center justify-between py-3 group"
                          >
                            <div className="flex items-center gap-2">
                              <RelatedIcon
                                className="w-4 h-4 text-text-sub group-hover:text-accent transition-colors"
                                aria-hidden
                              />
                              <span className="text-body text-text-main group-hover:text-primary transition-colors">
                                {related.name}
                              </span>
                            </div>
                            <ArrowRight
                              className="w-4 h-4 text-text-sub group-hover:text-accent transition-colors"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
