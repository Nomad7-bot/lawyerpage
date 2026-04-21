"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/admin/ToastProvider";

import { STATUS_META } from "@/lib/reservation-meta";

import type { ReservationStatus } from "@/types";

export type StatusChangeTarget = Extract<
  ReservationStatus,
  "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED"
>;

export type StatusChangeSummary = {
  reservation_no: string;
  client_name: string;
  preferred_date: string;
  preferred_time: string;
};

type StatusChangeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 변경 대상 ID (단건 또는 bulk) */
  ids: string[];
  /** 단건일 때 요약 표시. bulk 모드에서는 null */
  summary: StatusChangeSummary | null;
  /** 변경 후 상태 */
  targetStatus: StatusChangeTarget;
  /** 성공 시 부모 처리 — 상세 모달 닫기, 선택 해제 등 */
  onSuccess: () => void;
};

const ACTION_LABEL: Record<StatusChangeTarget, string> = {
  CONFIRMED: "확정",
  REJECTED: "반려",
  CANCELLED: "취소",
  COMPLETED: "완료",
};

/**
 * 상태 변경 확인 다이얼로그.
 *
 * - `targetStatus === "REJECTED"` 일 때만 사유 입력 textarea 노출
 * - 단건/bulk 모두 지원: `ids.length === 1` 이면 단건, 그 이상이면 bulk
 * - Promise.allSettled 로 부분 실패 허용, 결과는 토스트로 집계
 */
export function StatusChangeDialog({
  isOpen,
  onClose,
  ids,
  summary,
  targetStatus,
  onSuccess,
}: StatusChangeDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const isBulk = ids.length > 1;
  const isReject = targetStatus === "REJECTED";
  const actionLabel = ACTION_LABEL[targetStatus];
  const statusLabel = STATUS_META[targetStatus].label;

  useEffect(() => {
    if (!isOpen) {
      setRejectReason("");
      setSubmitting(false);
      setInlineError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isReject && rejectReason.trim().length === 0) {
      setInlineError("반려 사유를 입력해주세요");
      return;
    }
    setSubmitting(true);
    setInlineError(null);

    const body = JSON.stringify({
      status: targetStatus,
      ...(isReject ? { reject_reason: rejectReason.trim() } : {}),
    });

    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/reservations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        }).then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(
              data?.error ?? `HTTP ${res.status} — 처리에 실패했습니다`
            );
          }
          return res.json();
        })
      )
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.length - successCount;

    setSubmitting(false);

    if (failCount === 0) {
      if (isBulk) {
        toast.success(`${successCount}건 ${actionLabel} 처리 완료`);
      } else {
        toast.success(`예약이 ${statusLabel} 처리되었습니다`);
      }
      router.refresh();
      onSuccess();
      onClose();
      return;
    }

    if (successCount === 0) {
      const firstError = results.find((r) => r.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      const reason =
        firstError?.reason instanceof Error
          ? firstError.reason.message
          : "처리에 실패했습니다";
      toast.error(reason);
      setInlineError(reason);
      return;
    }

    // 부분 실패
    toast.error(`${successCount}건 성공, ${failCount}건 실패`);
    router.refresh();
    onSuccess();
    onClose();
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={onClose}
        disabled={submitting}
      >
        취소
      </Button>
      <Button
        type="button"
        variant={isReject ? "danger" : "primary"}
        size="md"
        onClick={handleSubmit}
        loading={submitting}
      >
        {actionLabel} {isBulk ? `(${ids.length}건)` : ""}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => undefined : onClose}
      title={`예약 ${actionLabel}`}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-body text-text-main">
          {isBulk
            ? `선택한 ${ids.length}건의 예약을 ${statusLabel} 처리하시겠습니까?`
            : `해당 예약을 ${statusLabel} 처리하시겠습니까?`}
        </p>

        {summary && !isBulk && (
          <dl className="space-y-1.5 rounded-card bg-bg-light px-4 py-3 text-caption">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-bold text-text-sub">예약번호</dt>
              <dd className="text-primary">{summary.reservation_no}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-bold text-text-sub">신청자</dt>
              <dd className="text-text-main">{summary.client_name} 님</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0 font-bold text-text-sub">일시</dt>
              <dd className="text-text-main tabular-nums">
                {summary.preferred_date} {summary.preferred_time.slice(0, 5)}
              </dd>
            </div>
          </dl>
        )}

        {isReject && (
          <>
            <Textarea
              label="반려 사유"
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="고객에게 전달할 반려 사유를 입력해주세요"
              maxLength={500}
              rows={4}
              disabled={submitting}
              error={inlineError ?? undefined}
            />
            {isBulk && (
              <p className="text-caption text-warning">
                ⚠ 선택한 {ids.length}건에 동일한 사유가 적용됩니다
              </p>
            )}
          </>
        )}

        {!isReject && inlineError && (
          <p className="text-caption text-error" role="alert">
            {inlineError}
          </p>
        )}
      </div>
    </Modal>
  );
}
