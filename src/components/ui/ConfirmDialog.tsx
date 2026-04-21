"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type Variant = "primary" | "danger";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  /** 확인 버튼 클릭 핸들러 — async 허용, 완료될 때까지 버튼 loading */
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
};

/**
 * 단순 확인 다이얼로그 (삭제/상태 변경 등).
 *
 * - 중립 액션: `variant="primary"` (기본)
 * - 파괴적 액션: `variant="danger"` (삭제 등)
 * - `children` 으로 사유 입력 등 추가 폼 주입 가능
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "primary",
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
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
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={variant}
        size="md"
        onClick={handleConfirm}
        loading={submitting}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? () => undefined : onClose}
      title={title}
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {message && <p className="text-body text-text-main">{message}</p>}
        {children}
      </div>
    </Modal>
  );
}
