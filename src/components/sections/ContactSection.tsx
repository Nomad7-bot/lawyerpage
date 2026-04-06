import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { SITE } from "@/constants/site";

type ContactRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

function ContactRow({ icon: Icon, label, value, href }: ContactRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 h-10 w-10 border border-white/20 flex items-center justify-center">
        <Icon className="h-4 w-4 text-accent" aria-hidden />
      </div>
      <div className="flex-1">
        <p className="text-caption text-white/50 uppercase tracking-widest">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="mt-1 block text-body text-white hover:text-accent transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="mt-1 text-body text-white leading-relaxed">{value}</p>
        )}
      </div>
    </div>
  );
}

export function ContactSection() {
  return (
    <section className="py-16 md:py-22 bg-primary text-white">
      <div className="container-content">
        {/* 인라인 타이틀 (흰색 버전) */}
        <div className="text-center">
          <h2 className="text-h2 font-bold text-white">상담 문의</h2>
          <div className="mx-auto mt-4 h-0.5 w-12 bg-accent" aria-hidden />
          <p className="mt-3 text-body text-white/70">
            전화 또는 예약 시스템을 통해 편하신 방법으로 상담을 신청해 주세요
          </p>
        </div>

        {/* 2컬럼: 연락처 | 지도 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* 연락처 정보 */}
          <div className="space-y-5 md:space-y-6">
            <ContactRow
              icon={MapPin}
              label="주소"
              value={SITE.nap.address}
            />
            <ContactRow
              icon={Phone}
              label="전화"
              value={SITE.nap.phoneDisplay}
              href={`tel:${SITE.nap.phone}`}
            />
            <ContactRow
              icon={Mail}
              label="이메일"
              value={SITE.nap.email}
              href={`mailto:${SITE.nap.email}`}
            />
            <ContactRow
              icon={Clock}
              label="영업시간"
              value={`평일 ${SITE.businessHours.weekday} · 토 ${SITE.businessHours.saturday}`}
            />

            <div className="pt-2">
              <Link
                href="/reservation"
                className={buttonStyles({
                  variant: "cta",
                  size: "lg",
                  fullWidth: true,
                })}
              >
                무료 상담 예약하기
              </Link>
            </div>
          </div>

          {/* 지도 플레이스홀더 */}
          <div className="aspect-[4/3] md:aspect-auto md:min-h-[360px] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-2">
            <MapPin className="h-12 w-12 text-white/30" aria-hidden />
            <p className="text-caption text-white/40">지도 준비 중</p>
          </div>
        </div>
      </div>
    </section>
  );
}
