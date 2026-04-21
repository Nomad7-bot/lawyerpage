"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Bell, Menu } from "lucide-react";

import { ADMIN_PAGE_TITLES } from "@/constants/adminNav";

type AdminHeaderProps = {
  /** 모바일 햄버거 클릭 콜백 (드로어 열기) */
  onMenuClick: () => void;
};

/**
 * 관리자 상단 헤더
 *
 * - 높이 64px, md 이상에서는 사이드바(w-64) 만큼 왼쪽 오프셋
 * - 모바일: 햄버거 버튼 표시 → 드로어 열기
 * - 페이지 제목은 pathname 기반 매핑 (ADMIN_PAGE_TITLES)
 * - 우측: 현재 날짜 + 알림 아이콘 (알림은 placeholder)
 */
export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = ADMIN_PAGE_TITLES[pathname] ?? "관리자";

  // SSR 와 CSR 의 `new Date()` 차이로 hydration 경고가 생기지 않도록
  // 초기 빈 문자열 → 마운트 후 주입
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(format(new Date(), "yyyy년 M월 d일 (E)", { locale: ko }));
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-bg-light bg-bg-white px-4 shadow-sm sm:px-6 md:left-64 md:px-8"
      aria-label="관리자 헤더"
    >
      {/* 좌측: 햄버거 + 제목 + 날짜 */}
      <div className="flex items-center gap-3 md:gap-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="메뉴 열기"
          className="inline-flex h-9 w-9 items-center justify-center text-text-main transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <h2 className="text-h4 font-bold text-primary">{title}</h2>

        {/* 데스크톱에서만 구분선 + 날짜 */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="h-4 w-px bg-text-sub/30" aria-hidden />
          <span className="text-caption text-text-sub">{today}</span>
        </div>
      </div>

      {/* 우측: 알림 (placeholder) */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="알림"
          title="알림 기능은 준비 중입니다"
          className="relative inline-flex h-9 w-9 items-center justify-center text-text-sub transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Bell className="h-5 w-5" aria-hidden />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden
          />
        </button>
      </div>
    </header>
  );
}
