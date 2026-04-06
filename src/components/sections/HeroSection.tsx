import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-[calc(100vh-80px)] bg-primary text-white overflow-hidden flex items-center">
      {/* ── 배경 장식: 좌측 accent 세로 라인 ── */}
      <div
        className="absolute left-0 top-0 hidden md:block h-full w-px bg-accent/30"
        aria-hidden
      />
      {/* ── 배경 장식: 우측 상단 accent 가로 라인 ── */}
      <div
        className="absolute right-0 top-20 hidden md:block h-px w-40 bg-accent/30"
        aria-hidden
      />
      {/* ── 배경 그라디언트 오버레이 ── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-primary-light/30"
        aria-hidden
      />

      <div className="container-content relative py-20 md:py-24">
        <div className="max-w-3xl">
          {/* 서브 헤드라인 */}
          <p className="flex items-center gap-3 text-caption font-semibold text-accent uppercase tracking-widest">
            <span className="h-px w-8 bg-accent" aria-hidden />
            신뢰할 수 있는 법률 파트너
          </p>

          {/* 메인 헤드라인 */}
          <h1 className="mt-6 text-h1 font-bold text-white leading-tight md:text-[56px] md:leading-[1.15]">
            25년 경력의 전문성으로
            <br />
            당신의 권리를 지킵니다
          </h1>

          {/* 설명 */}
          <p className="mt-6 text-body text-white/70 leading-relaxed md:max-w-2xl">
            민사, 형사, 가사, 기업법무 등 다양한 분야에서 축적된 노하우로
            의뢰인의 입장에서 최선의 결과를 이끌어내겠습니다.
          </p>

          {/* CTA 2개 */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/reservation"
              className={buttonStyles({
                variant: "cta",
                size: "lg",
                fullWidth: true,
                className: "sm:w-auto",
              })}
            >
              무료 상담 예약
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/practice-areas"
              className={buttonStyles({
                variant: "secondary",
                size: "lg",
                fullWidth: true,
                className:
                  "sm:w-auto border-white/30 text-white bg-transparent hover:bg-white hover:text-primary",
              })}
            >
              업무분야 보기
            </Link>
          </div>
        </div>
      </div>

      {/* ── 스크롤 인디케이터 ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40"
        aria-hidden
      >
        <span className="text-[10px] font-medium uppercase tracking-widest">
          Scroll
        </span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
