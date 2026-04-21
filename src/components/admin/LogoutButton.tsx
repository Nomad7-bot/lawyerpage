"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  /**
   * - `header`: navy 헤더 위에 얹히는 스타일 (primary 배경 대비 흰 글자)
   * - `sidebar`: 사이드바 하단에 얹히는 스타일 (흰 글자 불투명 + accent 호버)
   */
  variant?: "header" | "sidebar";
};

/**
 * 관리자 로그아웃 버튼
 *
 * - Supabase 세션 쿠키를 삭제하고 `/admin/login` 으로 이동
 * - `router.refresh()` 로 middleware 가 새 요청을 다시 평가해
 *   혹시 남은 상태를 SSR 단에서도 정리
 * - variant 에 따라 헤더용 / 사이드바용 스타일 분기
 */
export function LogoutButton({ variant = "header" }: LogoutButtonProps = {}) {
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

  // sidebar variant: 사이드바 하단에 얹히므로 ghost 배경 투명 유지하되
  //  정렬/간격/호버 색을 재지정. primary 위가 아니므로 !important 로 ghost 기본값을 덮어씀
  const variantClassName =
    variant === "sidebar"
      ? "!justify-start !px-2 !text-bg-white/70 hover:!text-bg-white hover:!bg-accent/10"
      : "!text-bg-white hover:!bg-primary-light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      fullWidth={variant === "sidebar"}
      loading={loading}
      onClick={handleLogout}
      className={cn(variantClassName)}
      aria-label="로그아웃"
    >
      <LogOut className="mr-1.5 h-4 w-4" aria-hidden />
      로그아웃
    </Button>
  );
}
