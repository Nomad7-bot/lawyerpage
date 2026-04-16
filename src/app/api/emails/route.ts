import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendEmail } from "@/lib/email";

/**
 * POST /api/emails — 이메일 발송 공통 엔드포인트
 *
 * 예약 이벤트 알림은 각 예약 Route 내부에서 `sendEmail()` 을 직접 호출하므로
 * 이 엔드포인트는 주로 관리자 수동 공지·외부 도구 테스트용이다.
 */
const sendEmailSchema = z.object({
  to: z.string().email("올바른 이메일 주소가 아닙니다"),
  subject: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하여야 합니다"),
  html: z.string().min(1, "본문을 입력해주세요"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { to, subject, html } = parsed.data;
    const result = await sendEmail(to, subject, html);

    if (!result.success) {
      return NextResponse.json(
        { error: "이메일 발송에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { id: result.id } });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
