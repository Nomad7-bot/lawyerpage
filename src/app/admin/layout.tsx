import type { Metadata } from "next";

/**
 * 관리자 레이아웃
 * Phase 3 에서 인증 가드(middleware) 및 사이드바 추가 예정
 */

// robots.txt Disallow 와 함께 이중 방어 — 내부 링크·북마크 경유 크롤링 차단
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-light">
      <header className="bg-primary text-bg-white border-b border-primary-light">
        <div className="container-content flex h-16 items-center">
          <span className="text-h4 font-bold">법률사무소 관리자</span>
        </div>
      </header>
      <main className="container-content py-8">{children}</main>
    </div>
  );
}
