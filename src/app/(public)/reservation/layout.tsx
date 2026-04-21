import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/buildMetadata";

/**
 * /reservation 과 /reservation/check 의 'use client' 제약 때문에
 * layout.tsx 에서 metadata 를 선언한다 (pass-through 레이아웃).
 * /reservation/check 는 하위 layout.tsx 가 별도 오버라이드.
 */
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "reservation",
    path: "/reservation",
    fallback: {
      title: "상담 예약",
      description:
        "전문 변호사와의 1:1 상담을 예약하세요. 예약번호와 함께 상담 일정을 즉시 확인할 수 있습니다.",
    },
  });
}

export default function ReservationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
