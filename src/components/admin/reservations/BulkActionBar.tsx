"use client";

import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

type BulkActionBarProps = {
  count: number;
  onBulkConfirm: () => void;
  onBulkReject: () => void;
  onClear: () => void;
};

/**
 * 다중 선택 시 상단 sticky 액션 바.
 *
 * - `count === 0` 이면 렌더 없음 (부모에서 조건부)
 * - 일괄 확정/반려 — PATCH 병렬 호출은 상위(dialog)가 담당
 */
export function BulkActionBar({
  count,
  onBulkConfirm,
  onBulkReject,
  onClear,
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent/30 bg-accent/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-caption font-bold uppercase tracking-widest text-accent">
          선택 {count}건
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-caption text-text-sub underline-offset-4 hover:text-primary hover:underline"
        >
          선택 해제
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onBulkConfirm}
        >
          <Check className="mr-1.5 h-4 w-4" aria-hidden />
          일괄 확정
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onBulkReject}
        >
          <X className="mr-1.5 h-4 w-4" aria-hidden />
          일괄 반려
        </Button>
      </div>
    </div>
  );
}
