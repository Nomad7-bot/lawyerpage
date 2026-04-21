"use client";

import { useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  X,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { STATUS_META } from "@/lib/reservation-meta";

import type { AdminReservationRow } from "@/lib/admin/reservations";
import type { StatusChangeTarget } from "@/components/admin/reservations/StatusChangeDialog";

type ReservationDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  row: AdminReservationRow | null;
  onRequestStatusChange: (
    row: AdminReservationRow,
    targetStatus: StatusChangeTarget
  ) => void;
};

function formatPreferred(date: string, time: string): string {
  // "YYYY-MM-DD" + "HH:MM:SS" → "YYYY.MM.DD HH:MM"
  return `${date.replaceAll("-", ".")} ${time.slice(0, 5)}`;
}

function formatCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(/\s/g, " ");
}

const CLAMP_THRESHOLD = 120;

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
        {title}
      </h3>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 text-caption">
      <dt className="w-24 shrink-0 font-bold text-text-sub">{label}</dt>
      <dd className="flex-1 text-text-main">{children}</dd>
    </div>
  );
}

/**
 * 예약 상세 모달 — 상태별로 하단 액션 버튼을 분기.
 *
 * PENDING: 확정 / 반려
 * CONFIRMED: 완료 처리 / 예약 취소
 * 그 외: 액션 없음 (불변 상태)
 */
export function ReservationDetailModal({
  isOpen,
  onClose,
  row,
  onRequestStatusChange,
}: ReservationDetailModalProps) {
  const [expandNote, setExpandNote] = useState(false);

  if (!row) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="예약 상세" size="xl">
        <p className="text-body text-text-sub">예약 정보를 불러오는 중...</p>
      </Modal>
    );
  }

  const meta = STATUS_META[row.status];
  const note = row.consultation_note ?? "";
  const needsClamp = note.length > CLAMP_THRESHOLD;
  const displayNote = !expandNote && needsClamp ? note.slice(0, CLAMP_THRESHOLD) + "…" : note;

  const renderFooter = () => {
    if (row.status === "PENDING") {
      return (
        <>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => onRequestStatusChange(row, "REJECTED")}
          >
            <X className="mr-1.5 h-4 w-4" aria-hidden />
            반려
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onRequestStatusChange(row, "CONFIRMED")}
          >
            <Check className="mr-1.5 h-4 w-4" aria-hidden />
            예약 확정
          </Button>
        </>
      );
    }
    if (row.status === "CONFIRMED") {
      return (
        <>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => onRequestStatusChange(row, "CANCELLED")}
          >
            <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
            예약 취소
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onRequestStatusChange(row, "COMPLETED")}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden />
            완료 처리
          </Button>
        </>
      );
    }
    return (
      <p className="text-caption text-text-sub">
        종료된 예약으로 상태 변경이 불가합니다
      </p>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="예약 상세"
      size="xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* 상단 요약 — 예약번호 + 상태 */}
        <div className="flex items-center justify-between rounded-card bg-bg-light px-4 py-3">
          <span className="text-body font-bold text-primary">
            {row.reservation_no}
          </span>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>

        <DetailSection title="Customer">
          <DetailRow label="이름">{row.client_name} 님</DetailRow>
          <DetailRow label="연락처">
            <span className="tabular-nums">{row.client_phone}</span>
          </DetailRow>
          <DetailRow label="이메일">
            <a
              href={`mailto:${row.client_email}`}
              className="underline-offset-4 hover:text-accent hover:underline"
            >
              {row.client_email}
            </a>
          </DetailRow>
        </DetailSection>

        <DetailSection title="Reservation">
          <DetailRow label="변호사">
            {row.attorney_name ?? "변호사 무관"}
          </DetailRow>
          <DetailRow label="상담 일시">
            <span className="tabular-nums">
              {formatPreferred(row.preferred_date, row.preferred_time)}
            </span>
          </DetailRow>
          <DetailRow label="상담 분야">
            {row.practice_area_name ?? "-"}
          </DetailRow>
          <DetailRow label="신청 시각">
            <span className="tabular-nums text-text-sub">
              {formatCreatedAt(row.created_at)}
            </span>
          </DetailRow>
        </DetailSection>

        <DetailSection title="Consultation Note">
          {note.length === 0 ? (
            <p className="text-caption text-text-sub">
              고객이 입력한 상담 내용이 없습니다
            </p>
          ) : (
            <div className="rounded-card bg-bg-light px-4 py-3">
              <p
                className={cn(
                  "whitespace-pre-wrap text-caption leading-relaxed text-text-main"
                )}
              >
                {displayNote}
              </p>
              {needsClamp && (
                <button
                  type="button"
                  onClick={() => setExpandNote((v) => !v)}
                  className="mt-2 inline-flex items-center gap-1 text-caption font-bold text-accent hover:text-accent-light"
                >
                  {expandNote ? (
                    <>
                      접기 <ChevronUp className="h-3 w-3" aria-hidden />
                    </>
                  ) : (
                    <>
                      더보기 <ChevronDown className="h-3 w-3" aria-hidden />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </DetailSection>

        {row.status === "REJECTED" && row.reject_reason && (
          <DetailSection title="Reject Reason">
            <div className="rounded-card border border-error/20 bg-error/5 px-4 py-3">
              <p className="whitespace-pre-wrap text-caption leading-relaxed text-error">
                {row.reject_reason}
              </p>
            </div>
          </DetailSection>
        )}
      </div>
    </Modal>
  );
}
