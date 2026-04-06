import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "상담 예약",
  description: "변호사 상담 예약을 신청하세요.",
};

export default function ReservationPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">상담 예약</h1>
      <p className="mt-4 text-body text-text-sub">
        예약 신청 폼 + 변호사 선택 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
