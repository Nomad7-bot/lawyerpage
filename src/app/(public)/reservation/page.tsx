"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/PageHeader";
import { StepIndicator } from "@/components/reservation/StepIndicator";
import { Step1Attorney } from "@/components/reservation/Step1Attorney";
import { useReservationStore } from "@/store/reservationStore";

// CLS 방지용 placeholder — 스텝 전환 시 높이 유지 (INP/레이아웃 안정)
function StepSkeleton() {
  return (
    <div
      className="min-h-[480px] animate-pulse space-y-4 rounded-card bg-bg-light/60 p-6"
      aria-hidden
    />
  );
}

// 첫 화면(Step1)은 정적 import 유지 — 초기 번들에 포함되어 LCP 개선.
// Step 2~4 는 사용자가 "다음" 을 눌러야 보이므로 동적 로드 (초기 번들에서 제거).
const Step2Schedule = dynamic(
  () =>
    import("@/components/reservation/Step2Schedule").then((m) => ({
      default: m.Step2Schedule,
    })),
  { ssr: false, loading: () => <StepSkeleton /> }
);
const Step3Info = dynamic(
  () =>
    import("@/components/reservation/Step3Info").then((m) => ({
      default: m.Step3Info,
    })),
  { ssr: false, loading: () => <StepSkeleton /> }
);
const Step4Confirm = dynamic(
  () =>
    import("@/components/reservation/Step4Confirm").then((m) => ({
      default: m.Step4Confirm,
    })),
  { ssr: false, loading: () => <StepSkeleton /> }
);

const STEP_LABELS: Record<number, string> = {
  1: "변호사 선택",
  2: "일정 선택",
  3: "정보 입력",
  4: "예약 확인",
};

export default function ReservationPage() {
  const step = useReservationStore((s) => s.step);
  const contentRef = useRef<HTMLDivElement>(null);

  // 스텝 변경 시 상단으로 스크롤
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "상담 예약" },
  ];

  return (
    <main>
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="상담 예약"
        subtitle="전문 변호사와의 1:1 상담을 예약하세요."
        size="sm"
      />

      {/* 폼 영역 */}
      <section className="py-12 md:py-16 bg-bg-white" ref={contentRef}>
        <div className="container-content max-w-2xl">
          {/* 현재 단계 안내 (모바일용 텍스트) */}
          <p className="mb-4 text-caption text-text-sub md:hidden">
            Step {step} / 4 — {STEP_LABELS[step]}
          </p>

          <StepIndicator currentStep={step} />

          {/* 스텝 콘텐츠 — key로 마운트/언마운트해 페이드 효과 */}
          <div
            key={step}
            className="step-enter"
          >
            {step === 1 && <Step1Attorney />}
            {step === 2 && <Step2Schedule />}
            {step === 3 && <Step3Info />}
            {step === 4 && <Step4Confirm />}
          </div>
        </div>
      </section>
    </main>
  );
}
