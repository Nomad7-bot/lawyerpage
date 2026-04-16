import { createClient } from "@supabase/supabase-js";

/**
 * Service Role 권한 Supabase 클라이언트
 *
 * - RLS 를 우회해 서버 라우트에서만 사용한다
 * - `SUPABASE_SERVICE_ROLE_KEY` 는 절대 클라이언트 번들에 노출되면 안 된다
 *   (`NEXT_PUBLIC_` 접두사 없음 → Next.js 가 서버 전용으로 취급)
 * - 호출부는 반드시 본인 인증(예: reservation_no + client_phone) 이후 사용
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
