"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/analytics";

/**
 * Google Analytics 4 스크립트 주입 + SPA pageview 추적.
 *
 * 조건부 렌더링:
 * - `NEXT_PUBLIC_GA_MEASUREMENT_ID` 미설정 → 스크립트 로드 안 함 (포트폴리오/로컬 안전)
 * - `/admin/*` 경로 → 관리자 트래픽 제외 (내부 사용자 지표 오염 방지)
 *
 * 로드 전략: `afterInteractive` — 페이지 상호작용 준비된 후 로드 (LCP 영향 최소화).
 * `send_page_view:false` 로 자동 전송을 끄고, usePathname 변경 시 수동으로 호출해
 * App Router SPA 이동도 정확히 집계.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const enabled =
    GA_MEASUREMENT_ID.length > 0 && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    pageview(pathname);
  }, [pathname, enabled]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
