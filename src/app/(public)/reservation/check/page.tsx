import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예약 조회",
  description: "예약번호와 연락처로 상담 예약을 조회/변경/취소하세요.",
};

export default function ReservationCheckPage() {
  return (
    <main className="container-content py-16 sm:py-24">
      <h1 className="text-h1 font-bold text-primary">예약 조회</h1>
      <p className="mt-4 text-body text-text-sub">
        예약 조회/변경/취소 페이지입니다. 준비 중입니다.
      </p>
    </main>
  );
}
