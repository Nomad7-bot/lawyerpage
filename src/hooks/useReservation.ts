"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  AttorneyListItem,
  PracticeAreaListItem,
  TimeSlot,
  ApiSuccessResponse,
  ApiErrorResponse,
  ReservationLookupResult,
} from "@/types";
import type { CreateReservationInput } from "@/lib/schemas/reservation";

// ── 공통 fetch 헬퍼 ──────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(body?.error ?? "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
  }

  const json = (await res.json()) as ApiSuccessResponse<T>;
  return json.data;
}

// ── 변호사 목록 조회 ─────────────────────────────────────────
// 브라우저 직접 Supabase 호출 시 모바일 Safari/ITP/콘텐츠 차단으로 실패하는
// 사례가 있어, 다른 훅들과 동일하게 same-origin `/api/*` 경유로 통일.

export function useAttorneys() {
  return useQuery<AttorneyListItem[]>({
    queryKey: ["attorneys"],
    queryFn: async () => {
      const result = await apiFetch<{ attorneys: AttorneyListItem[] }>(
        "/api/attorneys"
      );
      return result.attorneys;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── 상담분야 목록 조회 ───────────────────────────────────────

export function usePracticeAreas() {
  return useQuery<PracticeAreaListItem[]>({
    queryKey: ["practiceAreas"],
    queryFn: async () => {
      const result = await apiFetch<{ practice_areas: PracticeAreaListItem[] }>(
        "/api/practice-areas"
      );
      return result.practice_areas;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── 가용 시간 슬롯 조회 ──────────────────────────────────────

export function useTimeSlots(attorneyId: string | null | undefined, date: string | null) {
  return useQuery<TimeSlot[]>({
    queryKey: ["timeSlots", attorneyId, date],
    queryFn: async () => {
      const result = await apiFetch<{ slots: TimeSlot[] }>(
        `/api/slots?attorney_id=${attorneyId}&date=${date}`
      );
      return result.slots;
    },
    enabled: !!attorneyId && !!date,
    staleTime: 30 * 1000,
  });
}

// ── 예약 생성 ────────────────────────────────────────────────

type CreateReservationResult = {
  reservation_no: string;
  status: string;
};

export function useCreateReservation() {
  return useMutation<CreateReservationResult, Error, CreateReservationInput>({
    mutationFn: (payload) =>
      apiFetch<CreateReservationResult>("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

// ── 예약 조회 ────────────────────────────────────────────────

type LookupInput = {
  reservation_no: string;
  client_phone: string;
};

export function useLookupReservation() {
  return useMutation<ReservationLookupResult, Error, LookupInput>({
    mutationFn: (payload) =>
      apiFetch<ReservationLookupResult>("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

// ── 예약 취소 ────────────────────────────────────────────────

type CancelInput = {
  reservation_no: string;
  client_phone: string;
};

type CancelResult = {
  status: string;
};

export function useCancelReservation() {
  return useMutation<CancelResult, Error, CancelInput>({
    mutationFn: (payload) =>
      apiFetch<CancelResult>("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}

// ── 일정 변경 ────────────────────────────────────────────────

type ChangeInput = {
  reservation_no: string;
  client_phone: string;
  new_date: string;
  new_time: string;
};

type ChangeResult = {
  reservation_no: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
};

export function useChangeReservation() {
  return useMutation<ChangeResult, Error, ChangeInput>({
    mutationFn: (payload) =>
      apiFetch<ChangeResult>("/api/reservations/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
  });
}
