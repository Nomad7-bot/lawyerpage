"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type MiniCalendarProps = {
  selectedDate: string | null;
  onSelect: (ymd: string) => void;
};

/**
 * 예약 일정 변경 모달에서 사용하는 미니 캘린더.
 * - 오늘 이전 / 주말(토·일) disabled
 * - 선택 날짜는 primary 배경, 주말은 color-coded
 */
export function MiniCalendar({ selectedDate, onSelect }: MiniCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

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
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function isDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (d <= today) return true;
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-bg-light rounded-card"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-4 h-4 text-text-sub" aria-hidden />
        </button>
        <span className="text-body font-semibold text-primary">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-bg-light rounded-card"
          aria-label="다음 달"
        >
          <ChevronRight className="w-4 h-4 text-text-sub" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "text-center text-caption font-medium py-1",
              i === 0 && "text-error",
              i === 6 && "text-primary-light"
            )}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const ymd = toYMD(new Date(viewYear, viewMonth, day));
          const disabled = isDisabled(day);
          const isSelected = selectedDate === ymd;
          const isSun = new Date(viewYear, viewMonth, day).getDay() === 0;
          const isSat = new Date(viewYear, viewMonth, day).getDay() === 6;
          return (
            <button
              key={ymd}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(ymd)}
              className={cn(
                "h-9 w-full rounded-card text-caption transition-colors",
                isSelected && "bg-primary text-bg-white font-semibold",
                !isSelected && !disabled && "hover:bg-bg-light",
                !isSelected && !disabled && isSun && "text-error",
                !isSelected && !disabled && isSat && "text-primary-light",
                !isSelected && !disabled && !isSun && !isSat && "text-text-main",
                disabled && "text-text-sub/30 cursor-not-allowed"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
