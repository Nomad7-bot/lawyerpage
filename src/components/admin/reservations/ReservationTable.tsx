"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { STATUS_META } from "@/lib/reservation-meta";

import type { AdminReservationRow } from "@/lib/admin/reservations";

type SortKey = "created_at" | "preferred_date";
type SortOrder = "asc" | "desc";

type ReservationTableProps = {
  rows: AdminReservationRow[];
  sortBy: SortKey;
  sortOrder: SortOrder;
  selectedIds: Set<string>;
  onSelectionChange: (next: Set<string>) => void;
  onDetailClick: (row: AdminReservationRow) => void;
};

function formatDate(iso: string): string {
  // created_at → Asia/Seoul 기준 YYYY.MM.DD
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(iso))
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

function formatPreferred(date: string, time: string): string {
  const [, month, day] = date.split("-");
  return `${month}.${day} ${time.slice(0, 5)}`;
}

export function ReservationTable({
  rows,
  sortBy,
  sortOrder,
  selectedIds,
  onSelectionChange,
  onDetailClick,
}: ReservationTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const toggleSort = (key: SortKey) => {
    const sp = new URLSearchParams(params.toString());
    if (sortBy === key) {
      sp.set("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      sp.set("sortBy", key);
      sp.set("sortOrder", "desc");
    }
    router.push(`${pathname}?${sp.toString()}`);
  };

  const selectablePendingIds = rows
    .filter((r) => r.status === "PENDING")
    .map((r) => r.id);

  const allPendingSelected =
    selectablePendingIds.length > 0 &&
    selectablePendingIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allPendingSelected) {
      selectablePendingIds.forEach((id) => next.delete(id));
    } else {
      selectablePendingIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const SortIcon = ({ active, order }: { active: boolean; order: SortOrder }) =>
    !active ? (
      <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />
    ) : order === "asc" ? (
      <ArrowUp className="h-3 w-3" aria-hidden />
    ) : (
      <ArrowDown className="h-3 w-3" aria-hidden />
    );

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white px-6 py-16 text-center">
        <p className="text-body text-text-sub">조회된 예약이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-bg-light">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="현재 페이지 대기 예약 전체 선택"
                  checked={allPendingSelected}
                  onChange={toggleAll}
                  disabled={selectablePendingIds.length === 0}
                  className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                />
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                예약번호
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("created_at")}
                  className="inline-flex items-center gap-1 text-caption font-bold uppercase tracking-wider text-primary hover:text-accent"
                >
                  신청일
                  <SortIcon active={sortBy === "created_at"} order={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                신청자
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                연락처
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                변호사
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("preferred_date")}
                  className="inline-flex items-center gap-1 text-caption font-bold uppercase tracking-wider text-primary hover:text-accent"
                >
                  상담일시
                  <SortIcon
                    active={sortBy === "preferred_date"}
                    order={sortOrder}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                분야
              </th>
              <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                상태
              </th>
              <th className="w-16 px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-light">
            {rows.map((row) => {
              const meta = STATUS_META[row.status];
              const selectable = row.status === "PENDING";
              const selected = selectedIds.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors hover:bg-accent/5",
                    selected && "bg-accent/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`${row.reservation_no} 선택`}
                      checked={selected}
                      onChange={() => toggleOne(row.id)}
                      disabled={!selectable}
                      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </td>
                  <td className="px-4 py-3 text-caption font-semibold text-primary">
                    {row.reservation_no}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main">
                    {row.client_name} 님
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main tabular-nums">
                    {row.client_phone}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main">
                    {row.attorney_name ?? "변호사 무관"}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main tabular-nums">
                    {formatPreferred(row.preferred_date, row.preferred_time)}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main">
                    {row.practice_area_name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onDetailClick(row)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-none text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
                      aria-label={`${row.reservation_no} 상세 보기`}
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
