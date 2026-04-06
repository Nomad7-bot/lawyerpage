import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "법률사무소 소개 및 비전을 안내합니다.",
};

export default function AboutPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">소개</h1>
      <p className="mt-4 text-body text-text-sub">
        법률사무소 소개 및 비전 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
