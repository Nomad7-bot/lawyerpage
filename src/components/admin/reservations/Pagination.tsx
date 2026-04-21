"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
};

/**
 * URL searchParams 기반 페이지네이션.
 *
 * - 현재 페이지 주변 최대 5개 노출 (양쪽 2개 + 현재)
 * - `total === 0` 또는 1페이지면 렌더 없음
 */
export function Pagination({ page, pageSize, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const goto = (next: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(next));
    router.push(`${pathname}?${sp.toString()}`);
  };

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages: number[] = [];
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav
      aria-label="페이지네이션"
      className="flex items-center justify-center gap-1 py-4"
    >
      <button
        type="button"
        onClick={() => goto(page - 1)}
        disabled={page <= 1}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-none text-text-sub transition-colors",
          "hover:bg-accent/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        )}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      {pages.map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goto(p)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-none text-caption font-bold transition-colors",
              isActive
                ? "bg-primary text-bg-white"
                : "text-text-sub hover:bg-accent/10 hover:text-primary"
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goto(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-none text-text-sub transition-colors",
          "hover:bg-accent/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        )}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
