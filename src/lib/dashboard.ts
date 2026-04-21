import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { ReservationStatus } from "@/types";

export type DashboardStats = {
  today: {
    total: number;
    confirmed: number;
    pending: number;
  };
  pending: number;
  monthlyTotal: number;
  totalPosts: number;
};

export type RecentReservation = {
  id: string;
  reservation_no: string;
  client_name: string;
  attorney_name: string | null;
  preferred_date: string;
  preferred_time: string;
  status: ReservationStatus;
};

export type RecentPost = {
  id: string;
  title: string;
  category_name: string | null;
  created_at: string;
  is_published: boolean;
};

/**
 * 서울(Asia/Seoul) 기준 오늘 날짜 문자열 (YYYY-MM-DD).
 * 서버가 UTC 로 동작해도 한국 기준 자정 전/후 오프바이원 방지.
 */
function getSeoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * 서울 기준 이번 달의 시작/끝 날짜 (YYYY-MM-DD).
 */
function getSeoulMonthRange(): { start: string; end: string } {
  const today = getSeoulToday();
  const [year, month] = today.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/**
 * 대시보드 요약 카드용 4가지 집계.
 *
 * 실패 시 부분 장애가 페이지 전체를 무너뜨리지 않도록 기본값(0) 반환.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const today = getSeoulToday();
  const { start: monthStart, end: monthEnd } = getSeoulMonthRange();

  const [todayResult, pendingResult, monthlyResult, postsResult] =
    await Promise.all([
      // 오늘 예약 — status 별 분류를 위해 select 후 in-memory 카운트
      supabase
        .from("reservations")
        .select("status")
        .eq("preferred_date", today),
      // 전체 PENDING
      supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING"),
      // 이번 달 — preferred_date 기준
      supabase
        .from("reservations")
        .select("*", { count: "exact", head: true })
        .gte("preferred_date", monthStart)
        .lte("preferred_date", monthEnd),
      // 전체 게시글 — is_published 무관
      supabase.from("posts").select("*", { count: "exact", head: true }),
    ]);

  const todayRows = (todayResult.data ?? []) as Array<{
    status: ReservationStatus;
  }>;
  const todayStats = todayRows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.status === "CONFIRMED") acc.confirmed += 1;
      else if (row.status === "PENDING") acc.pending += 1;
      return acc;
    },
    { total: 0, confirmed: 0, pending: 0 }
  );

  if (todayResult.error) {
    console.error("[dashboard] 오늘 예약 조회 실패", todayResult.error);
  }
  if (pendingResult.error) {
    console.error("[dashboard] 대기 예약 조회 실패", pendingResult.error);
  }
  if (monthlyResult.error) {
    console.error("[dashboard] 월간 예약 조회 실패", monthlyResult.error);
  }
  if (postsResult.error) {
    console.error("[dashboard] 게시글 총수 조회 실패", postsResult.error);
  }

  return {
    today: todayStats,
    pending: pendingResult.count ?? 0,
    monthlyTotal: monthlyResult.count ?? 0,
    totalPosts: postsResult.count ?? 0,
  };
}

/**
 * 최근 예약 N건. created_at 내림차순.
 */
export async function getRecentReservations(
  limit = 5
): Promise<RecentReservation[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
        id,
        reservation_no,
        client_name,
        preferred_date,
        preferred_time,
        status,
        attorney:attorneys(name)
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[dashboard] 최근 예약 조회 실패", error);
    return [];
  }

  type Row = {
    id: string;
    reservation_no: string;
    client_name: string;
    preferred_date: string;
    preferred_time: string;
    status: ReservationStatus;
    // supabase-js 는 단일 관계 JOIN 을 배열로 반환 (typed-client 없을 때)
    attorney: { name: string } | { name: string }[] | null;
  };

  return (data as unknown as Row[]).map((row) => {
    const attorney = Array.isArray(row.attorney)
      ? row.attorney[0]
      : row.attorney;
    return {
      id: row.id,
      reservation_no: row.reservation_no,
      client_name: row.client_name,
      preferred_date: row.preferred_date,
      preferred_time: row.preferred_time,
      status: row.status,
      attorney_name: attorney?.name ?? null,
    };
  });
}

/**
 * 최근 게시글 N건. created_at 내림차순. 공개/비공개 모두 포함.
 */
export async function getRecentPosts(limit = 5): Promise<RecentPost[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
        id,
        title,
        created_at,
        is_published,
        category:post_categories(name)
      `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[dashboard] 최근 게시글 조회 실패", error);
    return [];
  }

  type Row = {
    id: string;
    title: string;
    created_at: string;
    is_published: boolean;
    category: { name: string } | { name: string }[] | null;
  };

  return (data as unknown as Row[]).map((row) => {
    const category = Array.isArray(row.category) ? row.category[0] : row.category;
    return {
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      is_published: row.is_published,
      category_name: category?.name ?? null,
    };
  });
}
