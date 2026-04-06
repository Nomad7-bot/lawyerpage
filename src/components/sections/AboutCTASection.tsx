import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";

export function AboutCTASection() {
  return (
    <section className="bg-primary py-16 md:py-22">
      <div className="container-content text-center">
        <h2 className="text-h2 font-bold text-bg-white">
          지금 바로 상담을 시작하세요
        </h2>
        <p className="mt-4 text-body text-bg-white/70">
          30년의 전문성과 신뢰로 의뢰인의 권리를 지켜드립니다.
          <br className="hidden md:block" />
          먼저 편하게 상담을 신청해 보세요.
        </p>
        <div className="mt-10">
          <Link
            href="/reservation"
            className={buttonStyles({ variant: "cta", size: "lg" })}
          >
            무료 상담 예약
          </Link>
        </div>
      </div>
    </section>
  );
}
