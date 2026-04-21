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
  attorney_id: string | null;
  attorney_name: string | null;
  practice_area_name: string | null;
  consultation_note: string | null;
  preferred_date: string;
  preferred_time: string;
  reject_reason: string | null;
  created_at: string;
};

// 변호사 목록 (브라우저 Supabase 쿼리 결과)
export type AttorneyListItem = {
  id: string;
  name: string;
  slug: string;
  position: string;
  specialties: string[];
};

// 상담분야 목록 (브라우저 Supabase 쿼리 결과)
export type PracticeAreaListItem = {
  id: string;
  name: string;
  slug: string;
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

// 관리자 사용자 (useAuth 훅 반환 타입)
export type AdminUser = {
  id: string;
  email: string | null;
};

// ─── 콘텐츠 관리 (Phase 3 STEP 6) ─────────────────────────

// 게시글 단건 (에디터용)
export type Post = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  tags: string[];
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

// 경력 항목 (attorneys.career JSONB 원소)
export type CareerItem = {
  year: string;
  content: string;
};

// 변호사 상세 (에디터용)
export type AttorneyFull = {
  id: string;
  name: string;
  slug: string;
  position: string | null;
  profile_image: string | null;
  bio: string | null;
  career: CareerItem[];
  display_order: number;
  is_active: boolean;
  practice_area_ids: string[];
  available_slots: AvailableSlot[];
  created_at: string;
  updated_at: string;
};

// 가용 슬롯 — available_slots 행
export type AvailableSlot = {
  day_of_week: number; // 0=일 ~ 6=토
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
  is_active: boolean;
};

// 업무분야 상세 (에디터용)
export type PracticeAreaFull = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detail_content: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

// 게시글 카테고리
export type PostCategory = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
};
