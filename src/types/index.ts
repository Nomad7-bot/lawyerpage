/**
 * 공통 타입 정의
 */

// 예약 상태
export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";

// reservations 테이블 행 타입
export type Reservation = {
  id: string;
  reservation_no: string;
  attorney_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  practice_area_id: string | null;
  consultation_note: string | null;
  preferred_date: string;
  preferred_time: string;
  status: ReservationStatus;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
};

// 예약 조회 결과 (attorney/practice_area JOIN + 연락처 마스킹)
export type ReservationLookupResult = {
  reservation_no: string;
  status: ReservationStatus;
  client_name: string;
  client_phone: string;
  client_email: string;
  attorney_name: string | null;
  practice_area_name: string | null;
  consultation_note: string | null;
  preferred_date: string;
  preferred_time: string;
  reject_reason: string | null;
  created_at: string;
};

// 가용 시간 슬롯
export type TimeSlot = {
  time: string;
  available: boolean;
};

// API 응답 래퍼
export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};
