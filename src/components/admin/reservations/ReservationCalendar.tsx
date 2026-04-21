"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

import type { AdminReservationRow } from "@/lib/admin/reservations";

type ReservationCalendarProps = {
  rows: AdminReservationRow[];
  month: string; // YYYY-MM
  today: string; // YYYY-MM-DD (Asia/Seoul)
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function parseMonth(month: string): { year: number; monthIdx: number } {
  const [y, m] = month.split("-").map(Number);
  return { year: y, monthIdx: m - 1 };
}

function addMonth(month: string, delta: number): string {
  const { year, monthIdx } = parseMonth(month);
  const d = new Date(year, monthIdx + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatDayKey(year: number, monthIdx: number, day: number): string {
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type CellInfo = {
  total: number;
  pending: number;
  confirmed: number;
};

export function ReservationCalendar({
  rows,
  month,
  today,
  selectedDate,
  onSelectDate,
}: ReservationCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const { year, monthIdx } = parseMonth(month);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIdx, 1).getDay();

  const byDay = useMemo(() => {
    const map = new Map<string, CellInfo>();
    for (const r of rows) {
      const key = r.preferred_date;
      const existing = map.get(key) ?? { total: 0, pending: 0, confirmed: 0 };
      existing.total += 1;
      if (r.status === "PENDING") existing.pending += 1;
      if (r.status === "CONFIRMED") existing.confirmed += 1;
      map.set(key, existing);
    }
    return map;
  }, [rows]);

  const goMonth = (delta: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("month", addMonth(month, delta));
    router.push(`${pathname}?${sp.toString()}`);
  };

  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
  }).format(new Date(year, monthIdx, 1));

  const cells: Array<{ day: number; key: string } | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, key: formatDayKey(year, monthIdx, d) });
  }
  // 마지막 주 빈 칸 padding
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-bg-light px-4 py-3">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-none text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <h3 className="text-h4 font-bold text-primary">{monthLabel}</h3>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-none text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-bg-light bg-bg-light/50">
        {WEEKDAY_LABELS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "px-2 py-2 text-center text-caption font-bold uppercase tracking-widest",
              i === 0 && "text-error",
              i === 6 && "text-primary-light",
              i !== 0 && i !== 6 && "text-text-sub"
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-24 border-b border-r border-bg-light bg-bg-light/20"
              />
            );
          }
          const info = byDay.get(cell.key);
          const isToday = cell.key === today;
          const isSelected = cell.key === selectedDate;
          const weekdayIdx = (firstWeekday + cell.day - 1) % 7;

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDate(cell.key)}
              className={cn(
                "group flex h-24 flex-col items-start gap-1 border-b border-r border-bg-light p-2 text-left transition-colors",
                "hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSelected && "bg-accent/10 ring-2 ring-accent"
              )}
              aria-pressed={isSelected}
            >
              <span
                className={cn(
                  "inline-flex h-6 min-w-[24px] items-center justify-center text-caption font-bold tabular-nums",
                  isToday && "rounded-full bg-primary px-1.5 text-bg-white",
                  !isToday && weekdayIdx === 0 && "text-error",
                  !isToday && weekdayIdx === 6 && "text-primary-light",
                  !isToday &&
                    weekdayIdx !== 0 &&
                    weekdayIdx !== 6 &&
                    "text-text-main"
                )}
              >
                {cell.day}
              </span>

              {info && info.total > 0 && (
                <div className="mt-auto flex flex-wrap items-center gap-1">
                  {info.pending > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      대기 {info.pending}
                    </span>
                  )}
                  {info.confirmed > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      확정 {info.confirmed}
                    </span>
                  )}
                  {info.total - info.pending - info.confirmed > 0 && (
                    <span className="text-[10px] font-bold text-text-sub">
                      기타 {info.total - info.pending - info.confirmed}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
