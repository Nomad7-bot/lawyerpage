import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { PRACTICE_AREAS } from "@/constants/dummy";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "practice-areas",
    path: "/practice-areas",
    fallback: {
      title: "업무분야",
      description:
        "분야별 전문 변호사가 최적의 법률 서비스를 제공합니다. 민사소송, 형사사건, 가사·이혼, 기업법무, 부동산, 노동·산재 전문.",
    },
  });
}

const breadcrumbItems = [
  { label: "홈", href: "/" },
  { label: "업무분야" },
];

export default function PracticeAreasPage() {
  return (
    <main>
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="업무분야"
        subtitle="분야별 전문 변호사가 최적의 법률 서비스를 제공합니다."
      />

      {/* 카드 그리드 */}
      <section className="py-16 md:py-22 bg-bg-light">
        <div className="container-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {PRACTICE_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <Link
                  key={area.slug}
                  href={`/practice-areas/${area.slug}`}
                  className="group"
                  aria-label={`${area.title} 상세 보기`}
                >
                  <Card hover className="h-full flex flex-col">
                    {/* 아이콘 */}
                    <div className="w-14 h-14 flex items-center justify-center bg-bg-light rounded-card">
                      <Icon className="w-7 h-7 text-primary" aria-hidden />
                    </div>

                    {/* 제목 */}
                    <h2 className="mt-5 text-h4 font-semibold text-primary">
                      {area.title}
                    </h2>

                    {/* 요약 */}
                    <p className="mt-2 text-body text-text-sub flex-1">
                      {area.description}
                    </p>

                    {/* 링크 */}
                    <div className="mt-6 flex items-center gap-1.5 text-caption font-semibold text-primary group-hover:text-accent transition-colors">
                      자세히 보기
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
