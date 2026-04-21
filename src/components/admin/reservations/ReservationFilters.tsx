"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";

import type {
  AttorneyOption,
  ReservationFilter,
} from "@/lib/admin/reservations";

type ReservationFiltersProps = {
  initial: ReservationFilter;
  attorneys: AttorneyOption[];
  view: "list" | "calendar";
};

const STATUS_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "대기중", value: "PENDING" },
  { label: "확정", value: "CONFIRMED" },
  { label: "취소", value: "CANCELLED" },
  { label: "반려", value: "REJECTED" },
  { label: "완료", value: "COMPLETED" },
] as const;

/**
 * 상태·변호사·날짜 범위 필터 — 검색 버튼 제출 시 URL push.
 *
 * - 캘린더 뷰에서는 날짜 범위 입력 숨김 (월 단위로 표시)
 * - 검색 시 page=1 로 리셋 (새 필터에서 과거 페이지 유지하면 빈 결과 방지)
 */
export function ReservationFilters({
  initial,
  attorneys,
  view,
}: ReservationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<string>(initial.status ?? "ALL");
  const [attorneyId, setAttorneyId] = useState<string>(
    initial.attorneyId ?? "ALL"
  );
  const [dateFrom, setDateFrom] = useState<string>(initial.dateFrom ?? "");
  const [dateTo, setDateTo] = useState<string>(initial.dateTo ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    sp.set("view", view);
    if (status && status !== "ALL") sp.set("status", status);
    if (attorneyId && attorneyId !== "ALL") sp.set("attorneyId", attorneyId);
    if (view === "list") {
      if (dateFrom) sp.set("dateFrom", dateFrom);
      if (dateTo) sp.set("dateTo", dateTo);
    }
    if (initial.sortBy) sp.set("sortBy", initial.sortBy);
    if (initial.sortOrder) sp.set("sortOrder", initial.sortOrder);
    // page 는 의도적으로 리셋
    router.push(`${pathname}?${sp.toString()}`);
  };

  const handleReset = () => {
    setStatus("ALL");
    setAttorneyId("ALL");
    setDateFrom("");
    setDateTo("");
    router.push(`${pathname}?view=${view}`);
  };

  const attorneyOptions = [
    { label: "전체", value: "ALL" },
    ...attorneys.map((a) => ({ label: a.name, value: a.id })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-bg-light bg-bg-white p-4"
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2",
          view === "list" ? "lg:grid-cols-4" : "lg:grid-cols-2"
        )}
      >
        <Select
          label="상태"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS}
        />
        <Select
          label="변호사"
          value={attorneyId}
          onChange={setAttorneyId}
          options={attorneyOptions}
        />
        {view === "list" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dateFrom"
                className="text-caption font-medium text-text-main"
              >
                시작일
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-12 w-full rounded-none border border-bg-light bg-bg-white px-4 py-3 text-body text-text-main focus:border-accent focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dateTo"
                className="text-caption font-medium text-text-main"
              >
                종료일
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="h-12 w-full rounded-none border border-bg-light bg-bg-white px-4 py-3 text-body text-text-main focus:border-accent focus:outline-none focus:ring-0"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-caption font-bold text-text-sub transition-colors hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          초기화
        </button>
        <Button type="submit" variant="primary" size="md">
          <Search className="mr-2 h-4 w-4" aria-hidden />
          검색
        </Button>
      </div>
    </form>
  );
}
