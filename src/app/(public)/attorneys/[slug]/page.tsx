import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPersonSchema } from "@/lib/schema";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { buttonStyles } from "@/components/ui/Button";
import { ATTORNEYS_DETAIL } from "@/constants/dummy";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const attorney = ATTORNEYS_DETAIL[slug];
  if (!attorney) return {};

  // attorneys 테이블에 meta_* 컬럼 없음 — 더미/본문에서 파생
  const title = `${attorney.name} ${attorney.position}`;
  const description =
    attorney.intro ?? attorney.bio.slice(0, 150);

  return buildMetadata({
    pageName: "attorney-detail",
    path: `/attorneys/${slug}`,
    fallback: { title, description },
  });
}

export default async function AttorneyDetailPage({ params }: Props) {
  const { slug } = await params;
  const attorney = ATTORNEYS_DETAIL[slug];

  if (!attorney) notFound();

  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "변호사 소개", href: "/attorneys" },
    { label: attorney.name },
  ];

  const personSchema = buildPersonSchema({
    slug: attorney.slug,
    name: attorney.name,
    position: attorney.position,
    specialties: attorney.specialties,
    intro: attorney.intro,
    bio: attorney.bio,
  });

  return (
    <main>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={personSchema} id="schema-person" />
      {/* ── Hero: navy 배경, 2컬럼 ── */}
      <section className="bg-primary">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* 사진 (4:5 비율 / 360×450) */}
            <div className="aspect-[4/5] md:max-h-[450px] bg-bg-white/10 flex items-center justify-center">
              <span className="text-h1 font-bold text-bg-white/20">
                {attorney.name[0]}
              </span>
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col justify-center py-12 md:py-16 md:pl-12">
              <Breadcrumb items={breadcrumbItems} variant="dark" />

              <span className="mt-5 text-caption font-bold text-accent uppercase tracking-widest">
                {attorney.position}
              </span>
              <h1 className="mt-2 text-h1 font-bold text-bg-white">
                {attorney.name}
              </h1>

              {/* 전문분야 태그 */}
              <div className="mt-4 flex flex-wrap gap-2">
                {attorney.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-caption px-3 py-1 bg-bg-white/10 text-bg-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* 소개문 */}
              <p className="mt-5 text-body text-bg-white/80">{attorney.bio}</p>

              {/* CTA 버튼 */}
              <div className="mt-8">
                <Link
                  href="/reservation"
                  className={buttonStyles({
                    variant: "cta",
                    size: "lg",
                    className: "inline-flex items-center gap-2",
                  })}
                >
                  <CalendarDays className="w-5 h-5" aria-hidden />
                  상담 예약하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 경력 Timeline ── */}
      <section className="py-16 md:py-22 bg-bg-white">
        <div className="container-content">
          <SectionTitle
            title="경력"
            subtitle="학력·자격·경력 사항"
            align="left"
            className="mb-12"
          />

          <div className="relative ml-4">
            {/* 세로선 */}
            <div
              className="absolute -left-4 top-0 bottom-0 w-0.5 bg-accent/30"
              aria-hidden
            />
            {attorney.career.map((item, idx) => (
              <div key={idx} className="relative pl-8 pb-10 last:pb-0">
                {/* 도트 */}
                <div
                  className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-accent -translate-x-1/2 ring-4 ring-bg-white"
                  aria-hidden
                />
                <span className="text-caption font-bold text-accent">
                  {item.year}
                </span>
                <h3 className="mt-0.5 text-body font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-body text-text-sub">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 전문 분야 3개 카드 ── */}
      <section className="py-16 md:py-22 bg-bg-light">
        <div className="container-content">
          <SectionTitle
            title="전문 분야"
            subtitle={`${attorney.name} 변호사의 주요 전문 분야입니다.`}
            align="left"
            className="mb-10"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {attorney.practiceAreas.map((area) => {
              const AreaIcon = area.icon;
              return (
                <Card key={area.title} className="flex flex-col">
                  <div className="w-12 h-12 flex items-center justify-center bg-bg-light rounded-card">
                    <AreaIcon className="w-6 h-6 text-accent" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-h4 font-semibold text-primary">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-body text-text-sub flex-1">
                    {area.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="bg-primary py-16 md:py-22">
        <div className="container-content text-center">
          <h2 className="text-h2 font-bold text-bg-white">
            {attorney.name} 변호사에게 직접 상담을 받으십시오
          </h2>
          <p className="mt-4 text-body text-bg-white/70">
            예약 가능한 시간을 확인하고 전문 변호사와 1:1 상담을 시작하세요.
          </p>
          <div className="mt-10">
            <Link
              href="/reservation"
              className={buttonStyles({ variant: "cta", size: "lg" })}
            >
              예약 가능 시간 확인
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
