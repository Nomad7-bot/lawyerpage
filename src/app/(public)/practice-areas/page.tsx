import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "업무분야",
  description: "법률사무소의 전문 업무분야를 소개합니다.",
};

export default function PracticeAreasPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">업무분야</h1>
      <p className="mt-4 text-body text-text-sub">
        전문 업무분야 리스트 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
