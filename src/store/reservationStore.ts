import { create } from "zustand";
import type { ReservationFormValues } from "@/lib/schemas/reservation";

export type ReservationStep = 1 | 2 | 3 | 4;

/**
 * 변호사 선택 상태
 * - undefined: 아직 선택하지 않음 (Step 1 미완료)
 * - null: "변호사 무관" 선택
 * - string: 특정 변호사 slug 선택
 */
export type AttorneySelection = string | null | undefined;

interface ReservationState {
  step: ReservationStep;
  selectedAttorneySlug: AttorneySelection;
  /** API 호출용 변호사 UUID (slug와 병행 저장) */
  selectedAttorneyId: string | null | undefined;
  /** "YYYY-MM-DD" 형식 */
  selectedDate: string | null;
  /** "HH:MM" 형식 */
  selectedTime: string | null;
  formData: Partial<ReservationFormValues>;
  reservationNumber: string | null;

  // actions
  setStep: (step: ReservationStep) => void;
  setAttorney: (slug: string | null, id: string | null) => void;
  setDate: (date: string | null) => void;
  setTime: (time: string | null) => void;
  setFormData: (data: Partial<ReservationFormValues>) => void;
  setReservationNumber: (num: string) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  step: 1 as ReservationStep,
  selectedAttorneySlug: undefined as AttorneySelection,
  selectedAttorneyId: undefined as string | null | undefined,
  selectedDate: null as string | null,
  selectedTime: null as string | null,
  formData: {} as Partial<ReservationFormValues>,
  reservationNumber: null as string | null,
};

export const useReservationStore = create<ReservationState>((set) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ step }),
  setAttorney: (slug, id) =>
    set({ selectedAttorneySlug: slug, selectedAttorneyId: id }),
  setDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setTime: (time) => set({ selectedTime: time }),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setReservationNumber: (num) => set({ reservationNumber: num }),
  reset: () => set(INITIAL_STATE),
}));
