"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { ATTORNEYS } from "@/constants/dummy";
import { useReservationStore } from "@/store/reservationStore";

export function Step1Attorney() {
  const { selectedAttorneySlug, setAttorney, setStep } = useReservationStore();

  // undefined = 아직 선택 안 함, null = "변호사 무관", string = 특정 변호사 slug
  const hasSelection = selectedAttorneySlug !== undefined;

  function isCardSelected(slug: string | null): boolean {
    return selectedAttorneySlug === slug;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h3 font-semibold text-primary">변호사 선택</h2>
        <p className="mt-1 text-body text-text-sub">
          상담받을 변호사를 선택하거나, 사무소에 배정을 맡기세요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 변호사 무관 카드 */}
        <button
          type="button"
          onClick={() => setAttorney(null)}
          className={cn(
            "text-left p-5 rounded-card border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            isCardSelected(null)
              ? "border-accent bg-accent/5"
              : "border-bg-light bg-bg-white hover:border-accent/40"
          )}
          aria-pressed={isCardSelected(null)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-bg-light flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-text-sub" aria-hidden />
            </div>
            <div>
              <p className="text-body font-semibold text-primary">
                변호사 무관
              </p>
              <p className="text-caption text-text-sub mt-0.5">
                담당 변호사 자동 배정
              </p>
            </div>
          </div>
          {isCardSelected(null) && (
            <p className="mt-3 text-caption text-accent font-medium">
              ✓ 선택됨
            </p>
          )}
        </button>

        {/* 변호사 카드 5개 */}
        {ATTORNEYS.map((attorney) => (
          <button
            key={attorney.slug}
            type="button"
            onClick={() => setAttorney(attorney.slug)}
            className={cn(
              "text-left p-5 rounded-card border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isCardSelected(attorney.slug)
                ? "border-accent bg-accent/5"
                : "border-bg-light bg-bg-white hover:border-accent/40"
            )}
            aria-pressed={isCardSelected(attorney.slug)}
          >
            <div className="flex items-center gap-4">
              {/* 아바타 */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-h4 font-bold text-primary/40">
                  {attorney.name[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-body font-semibold text-primary">
                  {attorney.name}
                </p>
                <p className="text-caption text-accent">{attorney.position}</p>
              </div>
            </div>
            {/* 전문분야 태그 */}
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
            {isCardSelected(attorney.slug) && (
              <p className="mt-2 text-caption text-accent font-medium">
                ✓ 선택됨
              </p>
            )}
          </button>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          disabled={!hasSelection}
          onClick={() => setStep(2)}
          className="w-full sm:w-auto"
        >
          다음 단계 →
        </Button>
      </div>
    </div>
  );
}
