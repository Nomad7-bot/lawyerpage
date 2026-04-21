"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, UserCircle2 } from "lucide-react";

import { LogoutButton } from "@/components/admin/LogoutButton";
import { SITE } from "@/constants/site";
import {
  ADMIN_EXTERNAL_MENU,
  ADMIN_MENU,
  type AdminNavItem,
  type AdminNavSubItem,
} from "@/constants/adminNav";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

type AdminSidebarProps = {
  /** 모바일 드로어 열림 상태 (md 이상에선 무시) */
  isOpen?: boolean;
  /** 모바일 드로어 닫기 콜백 (링크 클릭 시에도 호출) */
  onClose?: () => void;
};

/**
 * 관리자 공통 사이드바
 *
 * - 데스크톱(md+): 좌측 고정 w-64, 항상 표시
 * - 모바일(md 미만): 오른쪽으로 슬라이드 아웃, `isOpen` 토글로 드로어 동작
 * - active 판정은 pathname + (옵션) 쿼리 파라미터 일치 여부
 * - 콘텐츠 관리 expandable: 자식이 active 면 자동 열림, 사용자가 토글하면 그 상태 유지
 */
export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [manuallyOpen, setManuallyOpen] = useState<Record<string, boolean>>({});

  const isItemActive = (item: AdminNavItem | AdminNavSubItem): boolean => {
    // 외부 링크는 active 대상 아님
    if ("external" in item && item.external) return false;

    const [path] = item.href.split("?");
    if (pathname !== path) return false;

    if (item.match?.searchParam) {
      const { key, value } = item.match.searchParam;
      return searchParams.get(key) === value;
    }

    // 매치 파라미터 없는 경우: pathname 만 일치하면 active
    // (예: /admin/dashboard, /admin/seo, /admin/reservations)
    return true;
  };

  const isParentExpanded = (parent: AdminNavItem): boolean => {
    if (!parent.children) return false;
    // 자식 중 active 가 있으면 자동 open
    const childActive = parent.children.some((child) => isItemActive(child));
    // 사용자가 수동 토글한 적 있으면 그 값 우선
    return manuallyOpen[parent.href] ?? childActive;
  };

  /** 부모 자체 active 여부: 자식이 없을 때만 (자식 있는 경우 자식이 active) */
  const isParentStandaloneActive = (parent: AdminNavItem): boolean => {
    if (parent.children && parent.children.length > 0) return false;
    return isItemActive(parent);
  };

  const handleParentClick = (parent: AdminNavItem) => {
    const currentlyOpen = isParentExpanded(parent);
    setManuallyOpen((prev) => ({ ...prev, [parent.href]: !currentlyOpen }));
  };

  const baseItemClasses =
    "flex items-center gap-3 px-6 py-3 text-caption transition-colors";
  const inactiveClasses = "text-bg-white/70 hover:text-bg-white hover:bg-accent/10";
  const activeClasses =
    "text-accent bg-text-main/20 font-bold border-l-4 border-accent";

  const renderLeaf = (
    item: AdminNavSubItem | AdminNavItem,
    opts: { indent?: boolean; external?: boolean } = {}
  ) => {
    const active = isItemActive(item);
    const Icon = item.icon;
    const linkClassName = cn(
      baseItemClasses,
      active ? activeClasses : inactiveClasses,
      // border-l-4 공간을 active 가 아닐 때도 유지해 텍스트 좌측 정렬이 흔들리지 않게
      !active && "border-l-4 border-transparent",
      opts.indent && "pl-12"
    );

    if (opts.external) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          onClick={onClose}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span>{item.label}</span>
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={linkClassName}
        onClick={onClose}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span>{item.label}</span>
      </Link>
    );
  };

  const renderItem = (item: AdminNavItem) => {
    // Expandable 부모
    if (item.children && item.children.length > 0) {
      const expanded = isParentExpanded(item);
      const parentActive = isParentStandaloneActive(item);
      const Icon = item.icon;

      return (
        <div key={item.href}>
          <button
            type="button"
            onClick={() => handleParentClick(item)}
            aria-expanded={expanded}
            className={cn(
              baseItemClasses,
              "w-full border-l-4 border-transparent",
              parentActive ? activeClasses : inactiveClasses
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1 text-left">{item.label}</span>
            {expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            )}
          </button>
          {expanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => renderLeaf(child, { indent: true }))}
            </div>
          )}
        </div>
      );
    }

    // 일반 리프
    return renderLeaf(item);
  };

  // memoize user label
  const userEmail = useMemo(() => {
    if (loading) return "로그인 확인 중...";
    return user?.email ?? "관리자";
  }, [loading, user?.email]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-y-auto bg-primary",
        "transition-transform duration-300 ease-out",
        "md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      aria-label="관리자 네비게이션"
    >
      {/* 상단 브랜딩 */}
      <div className="px-8 py-10">
        <Link
          href="/admin/dashboard"
          onClick={onClose}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <h1 className="text-h4 font-bold uppercase tracking-[0.2em] text-accent">
            {SITE.name}
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-bg-white/50">
            관리자
          </p>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 space-y-1 px-4">
        {ADMIN_MENU.map((item) => renderItem(item))}

        {/* 구분선 */}
        <div className="my-3 border-t border-bg-white/10" aria-hidden />

        {/* 외부 링크 (홈페이지 보기) */}
        {ADMIN_EXTERNAL_MENU.map((item) =>
          renderLeaf(item, { external: item.external })
        )}
      </nav>

      {/* 하단 사용자 + 로그아웃 */}
      <div className="border-t border-bg-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-accent/20 text-accent">
            <UserCircle2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-caption font-bold text-bg-white">관리자</p>
            <p className="truncate text-[10px] text-bg-white/50">{userEmail}</p>
          </div>
        </div>
        <LogoutButton variant="sidebar" />
      </div>
    </aside>
  );
}
