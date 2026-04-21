"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X } from "lucide-react";
import { SITE, GNB_MENU } from "@/constants/site";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 스크롤 감지 → 헤더 축소/그림자
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ESC 키로 모바일 메뉴 닫기
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── 헤더 ── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-bg-white border-b border-bg-light",
          "transition-shadow duration-200",
          scrolled && "shadow-md"
        )}
      >
        <div
          className={cn(
            "container-content flex items-center justify-between transition-all duration-200",
            "h-14", // 모바일: 항상 56px
            scrolled ? "md:h-16" : "md:h-20" // 데스크톱: 스크롤 전 80px, 후 64px
          )}
        >
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label={`${SITE.name} 홈으로 이동`}
          >
            <span className="h-6 w-0.5 bg-accent" aria-hidden />
            <span className="text-h4 font-bold text-primary tracking-tight">
              {SITE.name}
            </span>
          </Link>

          {/* 데스크톱 GNB */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8"
            aria-label="글로벌 네비게이션"
          >
            {GNB_MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-body transition-colors",
                  isActive(item.href)
                    ? "text-primary font-semibold after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-accent"
                    : "text-text-main hover:text-primary"
                )}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 데스크톱 우측 CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${SITE.nap.phone}`}
              className="flex items-center gap-2 text-caption font-semibold text-primary hover:text-primary-light transition-colors"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {SITE.nap.phoneDisplay}
            </a>
            <Link
              href="/reservation"
              className={cn(
                "h-10 px-5 inline-flex items-center",
                "bg-accent text-bg-white text-caption font-semibold rounded-none",
                "hover:bg-accent-light hover:text-text-main transition-colors"
              )}
            >
              무료상담
            </Link>
          </div>

          {/* 모바일 우측 버튼 — WCAG AA 터치 타깃 44x44 이상 */}
          <div className="flex md:hidden items-center gap-1">
            <a
              href={`tel:${SITE.nap.phone}`}
              className="h-11 w-11 inline-flex items-center justify-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="전화 상담"
            >
              <Phone className="h-5 w-5" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              className="h-11 w-11 inline-flex items-center justify-center text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* ── 모바일 메뉴 백드롭 ── */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />

      {/* ── 모바일 메뉴 패널 (오른쪽 슬라이드인) ── */}
      <div
        id="mobile-nav-panel"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[280px] bg-primary flex flex-col",
          "transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* 패널 상단 */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-white/10 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <span className="h-5 w-0.5 bg-accent" aria-hidden />
            <span className="text-body font-bold text-white">{SITE.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="메뉴 닫기"
            className="h-11 w-11 inline-flex items-center justify-center text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* 메뉴 목록 */}
        <nav
          className="flex-1 overflow-y-auto px-6 py-4"
          aria-label="모바일 네비게이션"
        >
          <ul className="space-y-0.5">
            {GNB_MENU.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center h-12 text-body transition-colors",
                    isActive(item.href)
                      ? "text-accent font-semibold"
                      : "text-white/80 hover:text-white"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 하단 CTA */}
        <div className="px-6 pb-8 pt-4 shrink-0 border-t border-white/10">
          <Link
            href="/reservation"
            className={cn(
              "w-full h-12 inline-flex items-center justify-center",
              "bg-accent text-white font-semibold rounded-none",
              "hover:bg-accent-light hover:text-text-main transition-colors"
            )}
          >
            무료상담 예약하기
          </Link>
        </div>
      </div>
    </>
  );
}
