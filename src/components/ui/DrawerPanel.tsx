"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type DrawerPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 너비 (px). 기본 480. */
  width?: number;
};

/**
 * 우측에서 슬라이드-인 하는 Drawer 패널.
 *
 * - Modal 과 달리 전체 화면을 덮지 않고 우측 고정 너비로 표시
 * - ESC / 외부 클릭으로 닫기 (제출 중이면 onClose 를 부모가 차단)
 * - 바디 스크롤은 유지 — Modal 처럼 잠그지 않음 (배경과 상호작용 가능)
 */
export function DrawerPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 480,
}: DrawerPanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      aria-hidden={!isOpen}
      role="presentation"
    >
      {/* 배경 — 투명 (클릭 시 닫힘만 유지) */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden
      />
      {/* 패널 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        className={cn(
          "absolute right-0 top-0 flex h-full flex-col bg-bg-white shadow-2xl",
          "animate-[slide-in-right_200ms_ease-out]"
        )}
        style={{ width: `min(${width}px, 100vw)` }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-bg-light px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2
                id="drawer-title"
                className="truncate text-h4 font-bold text-primary"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 truncate text-caption text-text-sub">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-bg-light bg-bg-light/40 px-5 py-3">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
