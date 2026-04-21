import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildLegalServiceSchema } from "@/lib/schema";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 공개 페이지 전체에 LegalService + LocalBusiness 구조화 데이터 주입 (PRD §7 GEO) */}
      <JsonLd data={buildLegalServiceSchema()} id="schema-legal-service" />

      {/* 키보드 사용자용 Skip Navigation — Tab 키 진입 시 제일 먼저 포커스 (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-bg-white focus:rounded-card focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
      >
        본문으로 건너뛰기
      </a>

      <Header />
      <div id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </>
  );
}
