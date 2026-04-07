import { z } from "zod";

// ─── 프론트엔드 폼 스키마 (기존) ───────────────────────────

export const reservationFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z
    .string()
    .min(9, "올바른 연락처를 입력해주세요")
    .regex(/^[0-9\-]+$/, "숫자와 하이픈(-)만 입력 가능합니다"),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요")
    .email("올바른 이메일 형식이 아닙니다"),
  topic: z.string().min(1, "상담분야를 선택해주세요"),
  content: z.string().max(500).optional(),
  agreePrivacy: z.literal(true, {
    errorMap: () => ({ message: "개인정보 수집에 동의해주세요" }),
  }),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export type ReservationFormErrors = Partial<
  Record<keyof ReservationFormValues, string>
>;

// ─── 공통 패턴 ─────────────────────────────────────────────

const phonePattern = z
  .string()
  .regex(/^010-\d{4}-\d{4}$/, "올바른 연락처 형식이 아닙니다 (010-XXXX-XXXX)");

const datePattern = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)");

const timePattern = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다 (HH:MM)");

/** 내일 이후인지 검증하는 refine */
function isFutureDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target > today;
}

// ─── API 스키마 ────────────────────────────────────────────

/** POST /api/reservations — 예약 생성 */
export const createReservationSchema = z.object({
  attorney_id: z.string().uuid("올바른 변호사 ID가 아닙니다").optional(),
  client_name: z
    .string()
    .min(2, "이름은 2자 이상이어야 합니다")
    .max(20, "이름은 20자 이하여야 합니다"),
  client_phone: phonePattern,
  client_email: z.string().email("올바른 이메일 형식이 아닙니다"),
  practice_area_id: z.string().uuid("올바른 상담분야 ID가 아닙니다"),
  consultation_note: z.string().max(500, "상담 내용은 500자 이하여야 합니다").optional(),
  preferred_date: datePattern.refine(isFutureDate, "희망 상담일은 내일 이후여야 합니다"),
  preferred_time: timePattern,
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

/** POST /api/reservations/lookup — 예약 조회 */
export const lookupReservationSchema = z.object({
  reservation_no: z.string().min(1, "예약번호를 입력해주세요"),
  client_phone: phonePattern,
});

/** POST /api/reservations/cancel — 예약 취소 */
export const cancelReservationSchema = z.object({
  reservation_no: z.string().min(1, "예약번호를 입력해주세요"),
  client_phone: phonePattern,
});

/** POST /api/reservations/change — 일정 변경 */
export const changeReservationSchema = z.object({
  reservation_no: z.string().min(1, "예약번호를 입력해주세요"),
  client_phone: phonePattern,
  new_date: datePattern.refine(isFutureDate, "변경 희망일은 내일 이후여야 합니다"),
  new_time: timePattern,
});

/** PATCH /api/reservations/[id] — 관리자 상태 변경 */
export const adminUpdateSchema = z
  .object({
    status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"], {
      errorMap: () => ({ message: "허용되지 않는 상태값입니다" }),
    }),
    reject_reason: z.string().optional(),
  })
  .refine(
    (data) => data.status !== "REJECTED" || (data.reject_reason && data.reject_reason.trim().length > 0),
    { message: "반려 사유를 입력해주세요", path: ["reject_reason"] }
  );

export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;

/** GET /api/slots — 가용 시간 조회 */
export const getSlotsQuerySchema = z.object({
  attorney_id: z.string().uuid("올바른 변호사 ID가 아닙니다"),
  date: datePattern,
});
