import type { ReservationStatus } from "@/types";

/**
 * 예약 상태 뱃지 매핑 (서버/클라이언트 공용)
 *
 * - 뱃지 variant 는 `src/components/ui/Badge.tsx` 정의 그대로 재사용
 * - COMPLETED 는 "완료" 로 표시하되 confirmed 톤(성공) 유지
 */
export type ReservationStatusMeta = {
  label: string;
  variant: "pending" | "confirmed" | "cancelled" | "rejected";
};

export const STATUS_META: Record<ReservationStatus, ReservationStatusMeta> = {
  PENDING: { label: "대기", variant: "pending" },
  CONFIRMED: { label: "확정", variant: "confirmed" },
  CANCELLED: { label: "취소", variant: "cancelled" },
  REJECTED: { label: "거절", variant: "rejected" },
  COMPLETED: { label: "완료", variant: "confirmed" },
};

/**
 * 연락처 중간 4자리 마스킹 — 개인정보 보호.
 *
 *   010-1234-5678 → 010-****-5678
 *   비정형 입력은 원본 반환 (하위 호환성).
 */
export function maskPhone(phone: string): string {
  return phone.replace(/^(010-)\d{4}(-\d{4})$/, "$1****$2");
}
