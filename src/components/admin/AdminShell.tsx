"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
};

/**
 * 관리자 레이아웃 셸 (Client Wrapper)
 *
 * - 모바일 드로어 열림/닫힘 상태 관리
 * - 경로 변경 시 드로어 자동 닫기
 * - 사이드바(z-40) + 헤더(z-30) + 메인 조립
 * - 로그인 페이지는 `fixed inset-0 z-50` 로 자체적으로 이 셸 위를 덮음
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 경로 변경 시 드로어 자동 닫기
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg-light">
      {/* 사이드바 (데스크톱: 고정 / 모바일: 드로어) */}
      <AdminSidebar
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 모바일 드로어 백드롭 */}
      {isDrawerOpen && (
        <button
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-text-main/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* 상단 헤더 */}
      <AdminHeader onMenuClick={() => setIsDrawerOpen(true)} />

      {/* 메인 콘텐츠 영역 */}
      <main className="min-h-screen pt-16 md:ml-64">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
