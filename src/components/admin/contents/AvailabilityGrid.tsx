"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils/cn";

type SlotKey = string; // `${day}-${time}`

type Props = {
  /** 활성 슬롯 (day_of_week + "HH:MM") */
  value: Array<{ day_of_week: number; start_time: string }>;
  onChange: (next: Array<{ day_of_week: number; start_time: string }>) => void;
};

// 월(1)~토(6) — 일요일은 기본적으로 비업무일
const DAYS: { value: number; label: string }[] = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
];

const TIME_SLOTS: string[] = [];
for (let h = 9; h < 18; h += 1) {
  for (const m of [0, 30]) {
    TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:${m === 0 ? "00" : "30"}`);
  }
}

function toKey(day: number, time: string): SlotKey {
  return `${day}-${time}`;
}

/**
 * 상담 가능 시간 토글 그리드.
 *
 * - 월~토 × 09:00~17:30 30분 슬롯 (총 108개 셀)
 * - 각 셀 토글 시 value 에 `{day_of_week, start_time}` 추가/제거
 */
export function AvailabilityGrid({ value, onChange }: Props) {
  const active = useMemo(
    () =>
      new Set<SlotKey>(
        value.map((s) => toKey(s.day_of_week, s.start_time.slice(0, 5)))
      ),
    [value]
  );

  const toggle = (day: number, time: string) => {
    const key = toKey(day, time);
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);

    const nextArray: Array<{ day_of_week: number; start_time: string }> = [];
    for (const k of next) {
      const [d, t] = k.split("-");
      nextArray.push({ day_of_week: Number(d), start_time: t });
    }
    onChange(nextArray);
  };

  const toggleDay = (day: number) => {
    const allActive = TIME_SLOTS.every((t) => active.has(toKey(day, t)));
    const next = new Set(active);
    for (const t of TIME_SLOTS) {
      if (allActive) next.delete(toKey(day, t));
      else next.add(toKey(day, t));
    }
    const nextArray: Array<{ day_of_week: number; start_time: string }> = [];
    for (const k of next) {
      const [d, t] = k.split("-");
      nextArray.push({ day_of_week: Number(d), start_time: t });
    }
    onChange(nextArray);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-caption font-medium text-text-main">
          상담 가능 시간
        </label>
        <p className="text-caption text-text-sub">
          09:00 ~ 17:30, 30분 단위
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-caption">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-bg-light bg-bg-white px-2 py-2 text-left text-caption font-bold text-text-sub">
                시간
              </th>
              {DAYS.map((d) => {
                const allDay = TIME_SLOTS.every((t) =>
                  active.has(toKey(d.value, t))
                );
                return (
                  <th
                    key={d.value}
                    className="border-b border-bg-light px-2 py-2 text-center"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={cn(
                        "inline-flex h-8 w-full items-center justify-center text-caption font-bold transition-colors",
                        allDay
                          ? "bg-primary text-bg-white"
                          : "text-primary hover:bg-accent/10"
                      )}
                      aria-label={`${d.label}요일 전체 토글`}
                    >
                      {d.label}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((t) => (
              <tr key={t}>
                <td className="sticky left-0 z-10 border-r border-bg-light bg-bg-white px-2 py-1 text-caption font-semibold tabular-nums text-text-sub">
                  {t}
                </td>
                {DAYS.map((d) => {
                  const isActive = active.has(toKey(d.value, t));
                  return (
                    <td key={d.value} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => toggle(d.value, t)}
                        aria-pressed={isActive}
                        className={cn(
                          "h-7 w-full rounded-none border transition-colors",
                          isActive
                            ? "border-accent bg-accent text-bg-white"
                            : "border-bg-light bg-bg-white text-text-sub hover:border-accent/40 hover:bg-accent/5"
                        )}
                      >
                        {isActive ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
