import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware 전용 Supabase 클라이언트 + 세션 갱신 헬퍼
 *
 * - Next.js 15 Edge Runtime 에서 req/res 쿠키를 동시 관리한다
 * - `getUser()` 로 서버 검증(위변조 방지) 후 user 를 반환한다
 *   (※ `getSession()` 은 로컬 JWT 파싱만 하므로 보안 가드에 부적절)
 * - 호출부는 반환된 `response` 를 그대로 반환하거나,
 *   redirect 시 response.cookies 를 redirect 응답에 복사해야 한다
 *   (@supabase/ssr 공식 Next.js 15 패턴)
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          // 1) req.cookies 에 반영 → 이후 request.cookies.get 호출 시 최신 토큰 사용
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // 2) NextResponse 를 새로 만들어 response.cookies 에도 반영
          //    (브라우저에 Set-Cookie 헤더로 전달)
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getSession() 금지 — 반드시 getUser() 로 서버 검증
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}
