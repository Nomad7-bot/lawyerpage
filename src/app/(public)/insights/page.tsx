import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "법률정보",
  description: "법률 뉴스, 상담 사례, FAQ 등 유용한 법률 정보를 제공합니다.",
};

export default function InsightsPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">법률정보</h1>
      <p className="mt-4 text-body text-text-sub">
        법률 뉴스/사례/FAQ 리스트 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
