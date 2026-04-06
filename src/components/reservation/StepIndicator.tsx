"use client";

import { UserSearch, CalendarDays, ClipboardList, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ReservationStep } from "@/store/reservationStore";

const STEPS = [
  { step: 1, label: "변호사 선택", Icon: UserSearch },
  { step: 2, label: "일정 선택", Icon: CalendarDays },
  { step: 3, label: "정보 입력", Icon: ClipboardList },
  { step: 4, label: "예약 확인", Icon: CheckCircle2 },
] as const;

type StepIndicatorProps = {
  currentStep: ReservationStep;
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="예약 단계" className="mb-10">
      <ol className="flex items-center">
        {STEPS.map(({ step, label, Icon }, idx) => {
          const isDone = currentStep > step;
          const isActive = currentStep === step;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              {/* 스텝 아이콘 */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isDone && "bg-accent text-bg-white",
                    isActive && "bg-primary text-bg-white ring-4 ring-primary/20",
                    !isDone && !isActive && "bg-bg-light text-text-sub"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                {/* 레이블: 데스크톱만 */}
                <span
                  className={cn(
                    "hidden md:block text-caption whitespace-nowrap",
                    isActive && "text-primary font-semibold",
                    isDone && "text-accent font-medium",
                    !isDone && !isActive && "text-text-sub"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* 연결선 (마지막 제외) */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-5 md:mb-7 transition-colors",
                    isDone ? "bg-accent" : "bg-bg-light"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
