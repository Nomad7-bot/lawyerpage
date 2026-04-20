"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { AdminUser } from "@/types";

type UseAuthReturn = {
  user: AdminUser | null;
  loading: boolean;
};

/**
 * 관리자 인증 상태 훅
 *
 * - 마운트 시 `getUser()` 로 현재 세션 확인 (HTTP 1회)
 * - `onAuthStateChange` 구독으로 로그인/로그아웃/토큰 갱신 이벤트 반영
 * - cleanup 에서 subscription.unsubscribe() 필수
 * - StrictMode 이중 마운트 대비 `ignored` 플래그 사용
 *
 * ⚠️ Client Component 전용 (Server Component 에서 사용 금지)
 *    Server 측 인증 체크는 middleware 의 getUser 결과로 이미 담보됨
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();
    let ignored = false;

    const toAdminUser = (u: User | null): AdminUser | null =>
      u ? { id: u.id, email: u.email ?? null } : null;

    // 초기 세션 조회
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (ignored) return;
        setUser(toAdminUser(data.user));
        setLoading(false);
      })
      .catch(() => {
        if (ignored) return;
        setUser(null);
        setLoading(false);
      });

    // 이후 인증 이벤트 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignored) return;
      setUser(toAdminUser(session?.user ?? null));
    });

    return () => {
      ignored = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
