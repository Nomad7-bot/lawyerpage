import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { buttonStyles } from "@/components/ui/Button";
import { ATTORNEYS, ATTORNEYS_DETAIL } from "@/constants/dummy";

export const metadata: Metadata = {
  title: "변호사 소개",
  description:
    "각 분야 최고의 전문가가 함께합니다. 법률사무소 전문 변호사 5명의 프로필을 확인하세요.",
  openGraph: {
    title: "변호사 소개",
    description: "각 분야 최고의 전문가가 함께합니다.",
  },
};

const breadcrumbItems = [
  { label: "홈", href: "/" },
  { label: "변호사 소개" },
];

export default function AttorneysPage() {
  const [featuredBase, ...restBase] = ATTORNEYS;
  const featured = ATTORNEYS_DETAIL[featuredBase.slug];
  const gridAttorneys = restBase.map((a) => ATTORNEYS_DETAIL[a.slug]);

  return (
    <main>
      {/* Page Header Banner */}
      <section className="bg-primary flex flex-col justify-center min-h-[320px]">
        <div className="container-content py-12">
          <Breadcrumb
            items={breadcrumbItems}
            variant="dark"
          />
          <h1 className="mt-6 text-h1 font-bold text-bg-white">변호사 소개</h1>
          <p className="mt-3 text-body text-bg-white/70">
            각 분야 최고의 전문가가 함께합니다.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-22 bg-bg-light">
        <div className="container-content space-y-8">
          {/* Featured 카드 — 대표변호사 */}
          <Link href={`/attorneys/${featured.slug}`} className="group block">
            <div className="grid grid-cols-1 md:grid-cols-5 rounded-card overflow-hidden bg-bg-white shadow-sm transition-shadow duration-200 group-hover:shadow-lg border-b-4 border-transparent group-hover:border-accent">
              {/* 사진 영역 */}
              <div className="md:col-span-2">
                <div className="aspect-[3/4] md:aspect-auto md:h-full bg-primary/10 flex items-center justify-center min-h-[300px]">
                  <span className="text-h1 font-bold text-primary/20">
                    {featured.name[0]}
                  </span>
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="md:col-span-3 flex flex-col justify-center p-8 md:p-12">
                <span className="text-caption font-bold text-accent uppercase tracking-widest">
                  {featured.position}
                </span>
                <h2 className="mt-2 text-h2 font-bold text-primary">
                  {featured.name}
                </h2>
                <p className="mt-4 text-body text-text-sub italic">
                  &ldquo;{featured.intro}&rdquo;
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {featured.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-caption px-3 py-1 bg-bg-light text-text-main"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <span className={buttonStyles({ variant: "primary", size: "md" })}>
                    프로필 보기
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* 2×2 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {gridAttorneys.map((attorney) => (
              <Link
                key={attorney.slug}
                href={`/attorneys/${attorney.slug}`}
                className="group block"
                aria-label={`${attorney.name} 변호사 프로필 보기`}
              >
                <div className="bg-bg-white rounded-card overflow-hidden transition-shadow duration-200 group-hover:shadow-lg border-b-4 border-transparent group-hover:border-accent">
                  {/* 사진 (1:1.2 비율 = 5:6) */}
                  <div className="aspect-[5/6] bg-primary/10 flex items-center justify-center">
                    <span className="text-h1 font-bold text-primary/20">
                      {attorney.name[0]}
                    </span>
                  </div>

                  {/* 정보 */}
                  <div className="p-6">
                    <p className="text-caption font-semibold text-accent">
                      {attorney.position}
                    </p>
                    <h3 className="mt-1 text-h4 font-semibold text-primary">
                      {attorney.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {attorney.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-caption px-2 py-0.5 bg-bg-light text-text-main"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
