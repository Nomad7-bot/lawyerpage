"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { toYMD, formatDateKo, WEEKDAYS_KO } from "@/lib/utils/date";
import { useReservationStore } from "@/store/reservationStore";
import { useTimeSlots } from "@/hooks/useReservation";
import type { TimeSlot } from "@/types";

// "변호사 무관" 선택 시 기본 시간 슬롯
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: true },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: true },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
];

export function Step2Schedule() {
  const {
    selectedAttorneyId,
    selectedDate,
    selectedTime,
    setDate,
    setTime,
    setStep,
  } = useReservationStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // 변호사가 선택된 경우만 API 호출 (null = 변호사 무관 → 기본 슬롯 사용)
  const {
    data: apiSlots,
    isLoading: slotsLoading,
    error: slotsError,
  } = useTimeSlots(selectedAttorneyId ?? null, selectedDate);

  // 변호사 무관이면 기본 슬롯, 아니면 API 결과 사용
  const isAutoAssign = selectedAttorneyId === null;
  const timeSlots = isAutoAssign ? DEFAULT_TIME_SLOTS : (apiSlots ?? []);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calCells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function isDisabled(day: number): boolean {
    const d = new Date(viewYear, viewMonth, day);
    if (d <= today) return true;
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  }

  function handleDayClick(day: number) {
    if (isDisabled(day)) return;
    const ymd = toYMD(new Date(viewYear, viewMonth, day));
    setDate(ymd);
  }

  const canProceed = !!selectedDate && !!selectedTime;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-h3 font-semibold text-primary">일정 선택</h2>
        <p className="mt-1 text-body text-text-sub">
          상담 가능한 날짜와 시간을 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-8">
        {/* ── 캘린더 ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center hover:bg-bg-light rounded-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-5 h-5 text-text-sub" aria-hidden />
            </button>
            <span className="text-body font-semibold text-primary">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center hover:bg-bg-light rounded-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="다음 달"
            >
              <ChevronRight className="w-5 h-5 text-text-sub" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS_KO.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "text-center text-caption font-medium py-2",
                  i === 0 && "text-error",
                  i === 6 && "text-primary-light"
                )}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const ymd = toYMD(new Date(viewYear, viewMonth, day));
              const disabled = isDisabled(day);
              const isSelected = selectedDate === ymd;
              const isSunday =
                new Date(viewYear, viewMonth, day).getDay() === 0;
              const isSaturday =
                new Date(viewYear, viewMonth, day).getDay() === 6;

              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-10 w-full rounded-card text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isSelected && "bg-primary text-bg-white font-semibold",
                    !isSelected &&
                      !disabled &&
                      "hover:bg-bg-light text-text-main",
                    !isSelected && !disabled && isSunday && "text-error",
                    !isSelected &&
                      !disabled &&
                      isSaturday &&
                      "text-primary-light",
                    disabled && "text-text-sub/30 cursor-not-allowed"
                  )}
                  aria-label={`${viewYear}년 ${viewMonth + 1}월 ${day}일${disabled ? " (예약 불가)" : ""}`}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 시간 슬롯 ── */}
        <div>
          <p className="text-body font-semibold text-primary mb-3">
            {selectedDate
              ? formatDateKo(selectedDate)
              : "날짜를 먼저 선택하세요"}
          </p>

          {selectedDate ? (
            <>
              {/* 로딩 */}
              {!isAutoAssign && slotsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    className="w-5 h-5 animate-spin text-primary"
                    aria-hidden
                  />
                  <span className="ml-2 text-caption text-text-sub">
                    시간 조회 중...
                  </span>
                </div>
              )}

              {/* 에러 */}
              {!isAutoAssign && slotsError && (
                <p className="text-caption text-error py-4">
                  시간 슬롯을 불러오지 못했습니다. 다른 날짜를 선택해주세요.
                </p>
              )}

              {/* 슬롯 없음 */}
              {!slotsLoading && !slotsError && timeSlots.length === 0 && (
                <p className="text-caption text-text-sub py-4">
                  해당 날짜에 상담 가능한 시간이 없습니다.
                </p>
              )}

              {/* 슬롯 목록 */}
              {!slotsLoading && !slotsError && timeSlots.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
                  {timeSlots.map(({ time, available }) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        onClick={() => available && setTime(time)}
                        className={cn(
                          "h-11 rounded-card text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          isSelected && "bg-accent text-bg-white",
                          !isSelected &&
                            available &&
                            "border border-primary text-primary hover:bg-primary/5",
                          !available &&
                            "bg-bg-light text-text-sub/50 cursor-not-allowed"
                        )}
                        aria-label={`${time}${!available ? " (예약 불가)" : ""}`}
                        aria-pressed={isSelected}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <p className="text-caption text-text-sub">
              날짜를 선택하면 예약 가능한 시간이 표시됩니다.
            </p>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setStep(1)}
          className="w-full sm:w-auto"
        >
          ← 이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          disabled={!canProceed}
          onClick={() => setStep(3)}
          className="w-full sm:w-auto"
        >
          다음 단계 →
        </Button>
      </div>
    </div>
  );
}
