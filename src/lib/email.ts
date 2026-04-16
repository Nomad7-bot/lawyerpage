import { Resend } from "resend";

/**
 * Resend 이메일 발송 공통 함수
 *
 * - `RESEND_API_KEY` 는 서버 전용 환경변수 (NEXT_PUBLIC_ 접두사 없음)
 * - 모든 예외를 내부에서 포착 — 호출부로 throw 하지 않음
 * - 호출부는 `{ success }` 만 확인하고, 실패해도 비즈니스 로직은 정상 진행한다
 */

type SendEmailResult =
  | { success: true; id: string | undefined }
  | { success: false; error: unknown };

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY 미설정 — 발송 생략:", { to, subject });
    return { success: false, error: new Error("RESEND_API_KEY missing") };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({ from, to, subject, html });

    if (result.error) {
      console.error("[Email] 발송 실패:", { to, subject, error: result.error });
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[Email] 발송 예외:", { to, subject, error: err });
    return { success: false, error: err };
  }
}
