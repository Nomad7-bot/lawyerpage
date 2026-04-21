import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { maskPhone } from "@/lib/reservation-meta";

import type { Reservation, ReservationStatus } from "@/types";

export const PAGE_SIZE = 10;

export type ReservationFilter = {
  status?: ReservationStatus | "ALL";
  attorneyId?: string | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  sortBy?: "created_at" | "preferred_date";
  sortOrder?: "asc" | "desc";
};

export type AdminReservationRow = Reservation & {
  attorney_name: string | null;
  practice_area_name: string | null;
};

export type ReservationListResult = {
  rows: AdminReservationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AttorneyOption = { id: string; name: string };

/**
 * 서울 기준 이번 달 YYYY-MM 문자열.
 */
export function currentSeoulMonth(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .replace("-", "-"); // "YYYY-MM"
}

/**
 * YYYY-MM → { start: "YYYY-MM-01", end: "YYYY-MM-lastDay" }
 */
function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, "0");
  return {
    start: `${y}-${mm}-01`,
    end: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

type JoinedRow = Reservation & {
  attorney: { name: string } | { name: string }[] | null;
  practice_area: { name: string } | { name: string }[] | null;
};

function flatten(row: JoinedRow): AdminReservationRow {
  const attorney = Array.isArray(row.attorney) ? row.attorney[0] : row.attorney;
  const area = Array.isArray(row.practice_area)
    ? row.practice_area[0]
    : row.practice_area;
  // 마스킹은 서버에서 최종 적용 — 클라이언트로 원본 노출 최소화
  const { attorney: _a, practice_area: _p, ...rest } = row;
  return {
    ...rest,
    client_phone: maskPhone(row.client_phone),
    attorney_name: attorney?.name ?? null,
    practice_area_name: area?.name ?? null,
  };
}

const SELECT_COLUMNS = `
  id, reservation_no, attorney_id, client_name, client_phone, client_email,
  practice_area_id, consultation_note, preferred_date, preferred_time,
  status, reject_reason, created_at, updated_at,
  attorney:attorneys(name),
  practice_area:practice_areas(name)
` as const;

/**
 * 필터/페이지네이션/정렬을 반영한 예약 목록 조회 (리스트 뷰).
 *
 * 실패 시 부분 장애를 분리 — rows 빈 배열 + total 0 기본값 반환.
 */
export async function getReservations(
  filter: ReservationFilter
): Promise<ReservationListResult> {
  const supabase = createAdminClient();
  const page = Math.max(1, filter.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const sortBy = filter.sortBy ?? "created_at";
  const sortOrder = filter.sortOrder ?? "desc";

  let query = supabase
    .from("reservations")
    .select(SELECT_COLUMNS, { count: "exact" });

  if (filter.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status);
  }
  if (filter.attorneyId && filter.attorneyId !== "ALL") {
    query = query.eq("attorney_id", filter.attorneyId);
  }
  if (filter.dateFrom) {
    query = query.gte("preferred_date", filter.dateFrom);
  }
  if (filter.dateTo) {
    query = query.lte("preferred_date", filter.dateTo);
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  if (error) {
    console.error("[admin/reservations] 목록 조회 실패", error);
    return { rows: [], total: 0, page, pageSize: PAGE_SIZE };
  }

  const rows = (data as unknown as JoinedRow[]).map(flatten);
  return { rows, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

/**
 * 해당 월 전체 예약 (캘린더 뷰용).
 *
 * - preferred_date 기준 월 범위 필터
 * - 상태/변호사 필터만 반영 (날짜 범위·페이지네이션 무시)
 */
export async function getMonthReservations(
  month: string,
  filter: Pick<ReservationFilter, "status" | "attorneyId">
): Promise<AdminReservationRow[]> {
  const supabase = createAdminClient();
  const { start, end } = monthRange(month);

  let query = supabase
    .from("reservations")
    .select(SELECT_COLUMNS)
    .gte("preferred_date", start)
    .lte("preferred_date", end);

  if (filter.status && filter.status !== "ALL") {
    query = query.eq("status", filter.status);
  }
  if (filter.attorneyId && filter.attorneyId !== "ALL") {
    query = query.eq("attorney_id", filter.attorneyId);
  }

  const { data, error } = await query.order("preferred_time", {
    ascending: true,
  });

  if (error) {
    console.error("[admin/reservations] 월간 조회 실패", error);
    return [];
  }

  return (data as unknown as JoinedRow[]).map(flatten);
}

/**
 * 변호사 dropdown 옵션. active 만 노출 + name 가나다 정렬.
 */
export async function getAttorneyOptions(): Promise<AttorneyOption[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("attorneys")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("[admin/reservations] 변호사 목록 조회 실패", error);
    return [];
  }

  return (data ?? []).map((a) => ({ id: a.id as string, name: a.name as string }));
}
