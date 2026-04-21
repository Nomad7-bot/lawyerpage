import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/buildMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "reservation-check",
    path: "/reservation/check",
    fallback: {
      title: "예약 조회",
      description:
        "예약번호와 연락처로 상담 예약 상태를 확인하고 일정 변경·취소를 요청하세요.",
    },
  });
}

export default function ReservationCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
