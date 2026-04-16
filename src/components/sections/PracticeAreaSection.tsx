import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getIcon } from "@/lib/utils/iconMap";
import type { PracticeArea } from "@/types/database";

type PracticeAreaSectionProps = {
  areas: Pick<PracticeArea, "slug" | "name" | "description" | "icon_name">[];
};

function PracticeAreaCard({ area }: { area: PracticeAreaSectionProps["areas"][number] }) {
  const Icon = getIcon(area.icon_name);
  return (
    <Link
      href={`/practice-areas/${area.slug}`}
      className="block h-full group"
      aria-label={`${area.name} 업무분야 상세 보기`}
    >
      <Card hover padding="lg" className="h-full">
        <Icon className="h-10 w-10 text-accent" aria-hidden />
        <h3 className="mt-5 text-h4 text-primary">{area.name}</h3>
        <p className="mt-2 text-caption text-text-sub leading-relaxed">
          {area.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-caption text-primary font-medium group-hover:text-accent transition-colors">
          자세히 보기
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </Card>
    </Link>
  );
}

export function PracticeAreaSection({ areas }: PracticeAreaSectionProps) {
  return (
    <section className="py-16 md:py-22 bg-bg-light">
      <div className="container-content">
        <SectionTitle
          title="업무분야"
          subtitle="다양한 법률 분야에서 최상의 솔루션을 제공합니다"
          align="center"
        />

        {/* 데스크톱: 3x2 그리드 */}
        <div className="mt-12 hidden md:grid md:grid-cols-3 gap-6">
          {areas.map((area) => (
            <PracticeAreaCard key={area.slug} area={area} />
          ))}
        </div>

        {/* 모바일: 가로 스크롤 */}
        <div className="mt-10 md:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-4 snap-x snap-mandatory pb-4">
            {areas.map((area) => (
              <div
                key={area.slug}
                className="min-w-[280px] snap-start flex-shrink-0"
              >
                <PracticeAreaCard area={area} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
