import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "변호사 소개",
  description: "전문 변호사 프로필을 소개합니다.",
};

export default function AttorneysPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">변호사 소개</h1>
      <p className="mt-4 text-body text-text-sub">
        변호사 프로필 리스트 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
