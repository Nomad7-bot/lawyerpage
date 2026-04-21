"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, List } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type ViewToggleProps = {
  current: "list" | "calendar";
};

/**
 * 예약 관리 뷰 토글 — URL `?view=list|calendar` 로 관리.
 *
 * - 리스트 뷰와 캘린더 뷰는 다른 필터 쿼리(`dateFrom/dateTo` vs `month`)를 쓰므로
 *   뷰 전환 시 뷰 고유 파라미터는 리셋하고 공통 필터(status/attorneyId)만 유지
 */
export function ViewToggle({ current }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = (next: "list" | "calendar") => {
    if (next === current) return;
    const sp = new URLSearchParams();
    // 공통 필터만 유지 — 상태, 변호사
    const status = params.get("status");
    const attorneyId = params.get("attorneyId");
    if (status) sp.set("status", status);
    if (attorneyId) sp.set("attorneyId", attorneyId);
    sp.set("view", next);
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div
      role="tablist"
      aria-label="뷰 전환"
      className="inline-flex items-center rounded-card border border-bg-light bg-bg-white p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={current === "calendar"}
        onClick={() => go("calendar")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 px-3 text-caption font-bold uppercase tracking-wider transition-colors",
          current === "calendar"
            ? "bg-primary text-bg-white"
            : "text-text-sub hover:text-primary"
        )}
      >
        <CalendarDays className="h-4 w-4" aria-hidden />
        캘린더
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={current === "list"}
        onClick={() => go("list")}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 px-3 text-caption font-bold uppercase tracking-wider transition-colors",
          current === "list"
            ? "bg-primary text-bg-white"
            : "text-text-sub hover:text-primary"
        )}
      >
        <List className="h-4 w-4" aria-hidden />
        리스트
      </button>
    </div>
  );
}
