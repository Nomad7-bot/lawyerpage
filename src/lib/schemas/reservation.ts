import { z } from "zod";

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
