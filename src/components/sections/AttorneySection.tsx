import Link from "next/link";
import { User } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { AttorneyWithAreas } from "@/types/database";

type AttorneySectionProps = {
  attorneys: AttorneyWithAreas[];
};

/** attorney_practice_areas JOIN 에서 분야 이름 배열 파생 */
function toSpecialties(attorney: AttorneyWithAreas): string[] {
  return attorney.attorney_practice_areas
    .map((rel) => rel.practice_areas?.name)
    .filter((v): v is string => Boolean(v));
}

export function AttorneySection({ attorneys }: AttorneySectionProps) {
  return (
    <section className="py-16 md:py-22 bg-bg-white">
      <div className="container-content">
        <SectionTitle
          title="변호사 소개"
          subtitle="풍부한 경험과 전문성을 갖춘 변호사들이 함께합니다"
          align="center"
        />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {attorneys.map((attorney) => {
            const specialties = toSpecialties(attorney);
            return (
              <Link
                key={attorney.slug}
                href={`/attorneys/${attorney.slug}`}
                className="block group"
                aria-label={`${attorney.name} 변호사 프로필 보기`}
              >
                <Card hover padding="none" className="overflow-hidden h-full">
                  {/* 1:1 사진 플레이스홀더 */}
                  <div className="aspect-square bg-bg-light flex items-center justify-center">
                    <User
                      className="h-14 w-14 md:h-16 md:w-16 text-text-sub/30"
                      aria-hidden
                    />
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="text-caption text-accent font-medium">
                      {attorney.position}
                    </p>
                    <h3 className="mt-1 text-h4 text-primary group-hover:text-primary-light transition-colors">
                      {attorney.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {specialties.map((s) => (
                        <Badge key={s} variant="tag">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 전체보기 CTA */}
        <div className="mt-10 md:mt-12 text-center">
          <Link
            href="/attorneys"
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            변호사 전체보기
          </Link>
        </div>
      </div>
    </section>
  );
}
