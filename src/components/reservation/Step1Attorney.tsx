"use client";

import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useAttorneys } from "@/hooks/useReservation";
import { useReservationStore } from "@/store/reservationStore";

export function Step1Attorney() {
  const { selectedAttorneySlug, setAttorney, setStep } = useReservationStore();
  const { data: attorneys, isLoading, error, refetch } = useAttorneys();

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

      {/* 에러 상태 */}
      {error && (
        <div className="mb-4 p-4 bg-error/5 border border-error/20 rounded-card text-center">
          <p className="text-body text-error mb-3">
            변호사 목록을 불러오지 못했습니다.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 변호사 무관 카드 */}
        <button
          type="button"
          onClick={() => setAttorney(null, null)}
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

        {/* 로딩 스켈레톤 */}
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="p-5 rounded-card border-2 border-bg-light animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-bg-light shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-light rounded w-20" />
                  <div className="h-3 bg-bg-light rounded w-16" />
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                <div className="h-5 bg-bg-light rounded w-10" />
                <div className="h-5 bg-bg-light rounded w-12" />
              </div>
            </div>
          ))}

        {/* 변호사 카드 */}
        {attorneys?.map((attorney) => (
          <button
            key={attorney.slug}
            type="button"
            onClick={() => setAttorney(attorney.slug, attorney.id)}
            className={cn(
              "text-left p-5 rounded-card border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isCardSelected(attorney.slug)
                ? "border-accent bg-accent/5"
                : "border-bg-light bg-bg-white hover:border-accent/40"
            )}
            aria-pressed={isCardSelected(attorney.slug)}
          >
            <div className="flex items-center gap-4">
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
            {attorney.specialties.length > 0 && (
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
            )}
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
