import { Suspense } from "react";

import { AdminShell } from "@/components/admin/AdminShell";

/**
 * 관리자 공통 레이아웃
 *
 * - Server Component 유지
 * - 드로어 상태/URL 훅은 AdminShell(Client) 에서 담당
 * - useSearchParams(사이드바 active 판정 용) 는 Next.js 15 에서
 *   Suspense 경계 내부에서 사용해야 정적 prerender 경고 없음
 * - `/admin/login` 페이지는 자체 `fixed inset-0 z-50` 으로 이 레이아웃을 덮음
 * - 인증 가드는 src/middleware.ts 가 담당 (이 레이아웃에서 별도 처리 불요)
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
