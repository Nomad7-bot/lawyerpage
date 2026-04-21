"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ChevronDown } from "lucide-react";
import { GNB_MENU } from "@/constants/site";
import type { ResolvedSiteInfo } from "@/lib/site-info";
import { cn } from "@/lib/utils/cn";

// 푸터 빠른 링크 (GNB 서브셋)
const QUICK_LINKS = GNB_MENU.filter((item) =>
  ["/practice-areas", "/attorneys", "/insights", "/reservation"].includes(
    item.href
  )
);

type AccordionId = "links" | "contact" | "hours";

type FooterProps = {
  site: ResolvedSiteInfo;
};

export function Footer({ site }: FooterProps) {
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const year = new Date().getFullYear();

  const toggle = (id: AccordionId) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <footer className="bg-primary text-white">
      <div className="container-content py-12 md:py-16">
        {/* ── 데스크톱: 4컬럼 그리드 ── */}
        <div className="hidden md:grid grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: 로고 + 소개 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-6 w-0.5 bg-accent" aria-hidden />
              <span className="text-h4 font-bold text-white">{site.name}</span>
            </div>
            <p className="text-caption text-white/70 leading-relaxed">
              {site.description}
            </p>
          </div>

          {/* Col 2: 빠른 링크 */}
          <div>
            <h3 className="text-caption font-bold text-white/50 uppercase tracking-widest mb-5">
              빠른 링크
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-caption text-white/75 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: 연락처 */}
          <div>
            <h3 className="text-caption font-bold text-white/50 uppercase tracking-widest mb-5">
              연락처
            </h3>
            <address className="not-italic space-y-3 text-caption text-white/75">
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="h-4 w-4 mt-0.5 shrink-0 text-accent"
                  aria-hidden
                />
                <span className="leading-relaxed">{site.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a
                  href={`tel:${site.phone}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="h-4 w-4 shrink-0 flex items-center justify-center text-accent text-[10px] font-bold"
                  aria-label="팩스"
                >
                  FAX
                </span>
                <a
                  href={`tel:${site.fax}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.fax}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.email}
                </a>
              </div>
            </address>
          </div>

          {/* Col 4: 영업시간 */}
          <div>
            <h3 className="text-caption font-bold text-white/50 uppercase tracking-widest mb-5">
              영업시간
            </h3>
            <div className="flex items-start gap-2.5 text-caption">
              <Clock
                className="h-4 w-4 mt-0.5 shrink-0 text-accent"
                aria-hidden
              />
              <div className="space-y-2">
                <div>
                  <p className="text-white/50 text-[12px]">평일</p>
                  <p className="text-white/75">{site.hoursWeekday}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[12px]">토요일</p>
                  <p className="text-white/75">{site.hoursSaturday}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[12px]">일요일·공휴일</p>
                  <p className="text-white/75">{site.hoursSunday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 모바일: 아코디언 ── */}
        <div className="md:hidden">
          {/* 로고 + 소개 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-6 w-0.5 bg-accent" aria-hidden />
              <span className="text-h4 font-bold text-white">{site.name}</span>
            </div>
            <p className="text-caption text-white/70 leading-relaxed">
              {site.description}
            </p>
          </div>

          {/* 아코디언: 빠른 링크 */}
          <AccordionItem
            id="links"
            title="빠른 링크"
            isOpen={openId === "links"}
            onToggle={() => toggle("links")}
          >
            <ul className="space-y-3 pb-5">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-caption text-white/75 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionItem>

          {/* 아코디언: 연락처 */}
          <AccordionItem
            id="contact"
            title="연락처"
            isOpen={openId === "contact"}
            onToggle={() => toggle("contact")}
          >
            <address className="not-italic space-y-2.5 text-caption text-white/75 pb-5">
              <p className="leading-relaxed">{site.address}</p>
              <p>
                Tel.{" "}
                <a
                  href={`tel:${site.phone}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.phoneDisplay}
                </a>
              </p>
              <p>
                Fax.{" "}
                <a
                  href={`tel:${site.fax}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.fax}
                </a>
              </p>
              <p>
                Email.{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="hover:text-accent transition-colors"
                >
                  {site.email}
                </a>
              </p>
            </address>
          </AccordionItem>

          {/* 아코디언: 영업시간 */}
          <AccordionItem
            id="hours"
            title="영업시간"
            isOpen={openId === "hours"}
            onToggle={() => toggle("hours")}
          >
            <dl className="space-y-2 text-caption text-white/75 pb-5">
              <div className="flex gap-6">
                <dt className="w-20 text-white/50">평일</dt>
                <dd>{site.hoursWeekday}</dd>
              </div>
              <div className="flex gap-6">
                <dt className="w-20 text-white/50">토요일</dt>
                <dd>{site.hoursSaturday}</dd>
              </div>
              <div className="flex gap-6">
                <dt className="w-20 text-white/50">일/공휴일</dt>
                <dd>{site.hoursSunday}</dd>
              </div>
            </dl>
          </AccordionItem>
        </div>

        {/* ── 하단 바 ── */}
        <div className="mt-8 md:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-white/50">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-white/80 transition-colors"
            >
              개인정보처리방침
            </Link>
            <span aria-hidden>|</span>
            <Link
              href="/terms"
              className="hover:text-white/80 transition-colors"
            >
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── 아코디언 서브컴포넌트 ──
type AccordionItemProps = {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function AccordionItem({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: AccordionItemProps) {
  return (
    <div className="border-t border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-body text-white text-left"
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}`}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-white/50 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        id={`accordion-${id}`}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
