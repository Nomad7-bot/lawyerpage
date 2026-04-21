import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Admin 인증 가드
 *
 * - `/admin/login` 을 제외한 모든 `/admin/*` 경로에서 로그인 여부를 확인한다
 * - 미인증 → `/admin/login` 으로 redirect
 * - 이미 로그인한 상태에서 `/admin/login` 접근 → `/admin/dashboard` 로 redirect
 *
 * 주의: redirect 시 updateSession 이 이미 갱신한 쿠키를 반드시 전파해야 한다
 *       (그렇지 않으면 토큰 갱신이 브라우저에 반영되지 않음)
 */
export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // 미인증 사용자가 보호 경로에 접근 → 로그인 페이지로
  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // updateSession 이 담아둔 갱신 쿠키를 redirect 응답에도 복사
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // 이미 로그인한 사용자가 login 페이지 접근 → 대시보드로
  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    const redirectResponse = NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  // `/admin` 단독 접근도 매치되도록 두 패턴 모두 지정
  // Next.js Edge matcher 는 정적 자산(`_next/*`)을 자동 제외하지 않지만
  // 여기서는 `/admin` 으로 scope 가 제한되므로 별도 제외 불필요
  matcher: ["/admin", "/admin/:path*"],
};
