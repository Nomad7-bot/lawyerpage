import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오시는 길",
  description: "법률사무소 위치, 주소, 연락처 안내.",
};

export default function ContactPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">오시는 길</h1>
      <p className="mt-4 text-body text-text-sub">
        지도, 주소, 연락처 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
