"use client";

import { useEffect, useRef } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StepIndicator } from "@/components/reservation/StepIndicator";
import { Step1Attorney } from "@/components/reservation/Step1Attorney";
import { Step2Schedule } from "@/components/reservation/Step2Schedule";
import { Step3Info } from "@/components/reservation/Step3Info";
import { Step4Confirm } from "@/components/reservation/Step4Confirm";
import { useReservationStore } from "@/store/reservationStore";

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

  return (
    <main>
      {/* Page Header Banner */}
      <section className="bg-primary flex flex-col justify-center min-h-[200px]">
        <div className="container-content py-10">
          <Breadcrumb
            items={[
              { label: "홈", href: "/" },
              { label: "상담 예약" },
            ]}
            variant="dark"
          />
          <h1 className="mt-4 text-h1 font-bold text-bg-white">상담 예약</h1>
          <p className="mt-2 text-body text-bg-white/70">
            전문 변호사와의 1:1 상담을 예약하세요.
          </p>
        </div>
      </section>

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
