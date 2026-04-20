import { LogoutButton } from "@/components/admin/LogoutButton";

/**
 * 관리자 레이아웃
 *
 * - 인증 가드는 `src/middleware.ts` 가 담당 (모든 /admin/* 접근 시 getUser 검증)
 * - 로그인 페이지(`/admin/login`)는 `fixed inset-0 z-50` 으로
 *   이 레이아웃 위를 전체 덮어 헤더가 시각적으로 가려짐
 * - 사이드바는 Phase 3 후속 작업(예약/콘텐츠 관리)에서 추가 예정
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-light">
      <header className="bg-primary text-bg-white border-b border-primary-light">
        <div className="container-content flex h-16 items-center justify-between">
          <span className="text-h4 font-bold">법률사무소 관리자</span>
          <LogoutButton />
        </div>
      </header>
      <main className="container-content py-8">{children}</main>
    </div>
  );
}
