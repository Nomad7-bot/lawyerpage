"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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

export function useAttorneys() {
  return useQuery<AttorneyListItem[]>({
    queryKey: ["attorneys"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("attorneys")
        .select("id, name, slug, position, attorney_practice_areas(practice_areas(name))")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw new Error("변호사 목록을 불러올 수 없습니다.");
      if (!data) return [];

      return data.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
        position: row.position as string,
        specialties: (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((row as Record<string, unknown>).attorney_practice_areas as any[] ?? [])
        )
          .map((apa: { practice_areas: { name: string } | null }) => apa.practice_areas?.name)
          .filter((n: string | undefined): n is string => !!n),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── 상담분야 목록 조회 ───────────────────────────────────────

export function usePracticeAreas() {
  return useQuery<PracticeAreaListItem[]>({
    queryKey: ["practiceAreas"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("practice_areas")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw new Error("상담분야 목록을 불러올 수 없습니다.");
      return (data ?? []) as PracticeAreaListItem[];
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
