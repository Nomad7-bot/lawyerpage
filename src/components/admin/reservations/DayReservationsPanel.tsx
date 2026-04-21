"use client";

import { CalendarDays, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { STATUS_META } from "@/lib/reservation-meta";

import type { AdminReservationRow } from "@/lib/admin/reservations";

type DayReservationsPanelProps = {
  selectedDate: string | null;
  rows: AdminReservationRow[];
  onRowClick: (row: AdminReservationRow) => void;
};

function formatDateLabel(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function DayReservationsPanel({
  selectedDate,
  rows,
  onRowClick,
}: DayReservationsPanelProps) {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-card border border-bg-light bg-bg-white">
      <header className="border-b border-bg-light px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Day Detail
        </p>
        <h3 className="mt-1 text-h4 font-bold text-primary">
          {selectedDate ? formatDateLabel(selectedDate) : "날짜를 선택하세요"}
        </h3>
      </header>

      {!selectedDate ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <CalendarDays
            className="h-10 w-10 text-text-sub/40"
            aria-hidden
          />
          <p className="text-caption text-text-sub">
            캘린더에서 날짜를 선택하면 해당일 예약 목록이 표시됩니다
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <p className="text-caption text-text-sub">
            이 날짜에 등록된 예약이 없습니다
          </p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-bg-light overflow-y-auto">
          {rows.map((row) => {
            const meta = STATUS_META[row.status];
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    "hover:bg-accent/5 focus-visible:outline-none focus-visible:bg-accent/5"
                  )}
                >
                  <div className="flex w-14 shrink-0 flex-col items-center border-r border-bg-light pr-3">
                    <span className="text-caption font-bold tabular-nums text-primary">
                      {row.preferred_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-semibold text-primary">
                        {row.client_name} 님
                      </p>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="text-caption text-text-sub">
                      {row.attorney_name
                        ? `${row.attorney_name} 변호사`
                        : "변호사 무관"}
                      {row.practice_area_name
                        ? ` · ${row.practice_area_name}`
                        : ""}
                    </p>
                    <p className="text-caption font-semibold text-text-sub">
                      {row.reservation_no}
                    </p>
                  </div>
                  <ChevronRight
                    className="mt-1 h-4 w-4 shrink-0 text-text-sub/60"
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
