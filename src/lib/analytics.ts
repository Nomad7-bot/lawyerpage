/**
 * Google Analytics 4 — gtag.js 헬퍼 (PRD §7 분석)
 *
 * 환경변수 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 미설정 시 모든 호출이 no-op.
 * 포트폴리오/로컬 환경에서도 에러 없이 동작.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** GA 활성화 여부 (env 설정 + 브라우저 환경 + gtag 주입 완료) */
function isGaReady(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    GA_MEASUREMENT_ID.length > 0
  );
}

/**
 * SPA 페이지 이동 추적 — usePathname 변경 시 호출.
 * send_page_view:false 로 초기화했다면 수동으로 page_view 이벤트 전송.
 */
export function pageview(url: string): void {
  if (!isGaReady()) return;
  window.gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

/**
 * 사용자 정의 이벤트 추적.
 * 예: event('reservation_submit', { attorney, area })
 */
export function event(
  action: string,
  params: Record<string, unknown> = {}
): void {
  if (!isGaReady()) return;
  window.gtag("event", action, params);
}

// ─────────────────────────────────────────────
// window.gtag 전역 타입 선언
// ─────────────────────────────────────────────
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "set" | "consent" | "js",
      targetId: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
