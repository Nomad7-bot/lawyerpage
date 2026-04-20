"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

/**
 * 관리자 로그아웃 버튼
 *
 * - Supabase 세션 쿠키를 삭제하고 `/admin/login` 으로 이동
 * - `router.refresh()` 로 middleware 가 새 요청을 다시 평가해
 *   혹시 남은 상태를 SSR 단에서도 정리
 * - admin layout 헤더 우측에 배치됨
 */
export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } finally {
      // router.push 이후 언마운트되지만, 혹시 동일 경로로 튕겼을 경우 대비
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={handleLogout}
      className="!text-bg-white hover:!bg-primary-light"
      aria-label="로그아웃"
    >
      <LogOut className="mr-1.5 h-4 w-4" aria-hidden />
      로그아웃
    </Button>
  );
}
