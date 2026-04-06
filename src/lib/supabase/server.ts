import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버 환경(Server Components, Route Handlers, Server Actions)에서 사용할
 * Supabase 클라이언트. Next.js cookies() 와 연동하여 세션을 관리한다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component 에서 호출되면 set 이 제한될 수 있음.
            // middleware 에서 세션 갱신을 처리하면 무시 가능.
          }
        },
      },
    }
  );
}
