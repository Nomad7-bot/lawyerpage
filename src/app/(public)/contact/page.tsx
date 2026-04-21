import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Clock, Mail, Train, Bus, Car } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonStyles } from "@/components/ui/Button";
import { GoogleMap } from "@/components/map/GoogleMap";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { SITE } from "@/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "contact",
    path: "/contact",
    fallback: {
      title: "오시는 길",
      description: `${SITE.nap.name} 위치 안내. ${SITE.nap.address}. 전화: ${SITE.nap.phone}`,
    },
  });
}

// 교통편 더미 데이터 (site.ts NAP 기준: 서초구 서초대로)
const TRANSPORT = [
  {
    Icon: Train,
    label: "지하철",
    lines: [
      {
        title: "3호선 교대역 10번 출구",
        desc: "출구에서 서초대로 방향으로 도보 3분",
      },
      {
        title: "2호선 강남역 12번 출구",
        desc: "출구에서 서초대로 방향으로 도보 7분",
      },
    ],
  },
  {
    Icon: Bus,
    label: "버스",
    lines: [
      {
        title: "서초대로 정류장 하차",
        desc: "간선: 140, 146, 341, 405 / 지선: 3012, 4319",
      },
    ],
  },
  {
    Icon: Car,
    label: "자가용",
    lines: [
      {
        title: "건물 지하 주차장 이용",
        desc: "방문 고객 2시간 무료 주차 제공 (주차권 수령 필수)",
      },
    ],
  },
];

const HOURS = [
  { day: "평일", time: SITE.businessHours.weekday },
  { day: "토요일", time: SITE.businessHours.saturday },
  { day: "일요일·공휴일", time: SITE.businessHours.sunday },
];

export default function ContactPage() {
  const { nap } = SITE;
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "오시는 길" },
  ];

  return (
    <main>
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="오시는 길"
        subtitle={nap.address}
      />

      {/* 지도 섹션 */}
      <section aria-label="사무소 위치 지도">
        <GoogleMap
          title={`${nap.name} 위치 안내 지도`}
          fallbackAddress={nap.address}
          height={480}
        />

        {/* 빠른 정보 바 */}
        <div className="bg-primary">
          <div className="container-content">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-bg-white/10">
              {/* 주소 */}
              <div className="flex items-start gap-3 py-5 px-4">
                <MapPin
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <p className="text-caption font-semibold text-bg-white/60 uppercase tracking-wide">
                    주소
                  </p>
                  <address className="not-italic mt-1 text-body text-bg-white">
                    {nap.address}
                  </address>
                </div>
              </div>

              {/* 전화 */}
              <div className="flex items-start gap-3 py-5 px-4">
                <Phone
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <p className="text-caption font-semibold text-bg-white/60 uppercase tracking-wide">
                    전화
                  </p>
                  <a
                    href={`tel:${nap.phone.replace(/-/g, "")}`}
                    className="mt-1 text-body text-bg-white hover:text-accent transition-colors"
                  >
                    {nap.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* 영업시간 */}
              <div className="flex items-start gap-3 py-5 px-4">
                <Clock
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  aria-hidden
                />
                <div>
                  <p className="text-caption font-semibold text-bg-white/60 uppercase tracking-wide">
                    영업시간
                  </p>
                  <p className="mt-1 text-body text-bg-white">
                    평일 {SITE.businessHours.weekday}
                  </p>
                  <p className="text-caption text-bg-white/60">
                    토 {SITE.businessHours.saturday} / 일·공휴일 휴무
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 상세 섹션 */}
      <section className="py-16 md:py-22 bg-bg-white">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
            {/* ── 왼쪽: 찾아오시는 방법 (6컬럼) ── */}
            <div className="md:col-span-7">
              <h2 className="text-h3 font-semibold text-primary">
                찾아오시는 방법
              </h2>
              <div className="mt-3 h-0.5 w-12 bg-accent" aria-hidden />

              <div className="mt-8 space-y-5">
                {TRANSPORT.map(({ Icon, label, lines }) => (
                  <div
                    key={label}
                    className="rounded-card border border-bg-light p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon
                          className="w-5 h-5 text-primary"
                          aria-hidden
                        />
                      </div>
                      <h3 className="text-h4 font-semibold text-primary">
                        {label}
                      </h3>
                    </div>

                    <div className="space-y-3 pl-[52px]">
                      {lines.map((line) => (
                        <div key={line.title}>
                          <p className="text-body font-medium text-text-main">
                            {line.title}
                          </p>
                          <p className="mt-0.5 text-caption text-text-sub">
                            {line.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 오른쪽: 연락처 카드 (5컬럼) ── */}
            <div className="md:col-span-5">
              <div className="bg-primary rounded-card p-7 text-bg-white">
                {/* 사무소명 */}
                <p className="text-caption font-bold text-accent uppercase tracking-widest">
                  법률사무소
                </p>
                <h2 className="mt-1 text-h3 font-bold text-bg-white">
                  {nap.name}
                </h2>

                {/* 연락처 항목 */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-5 h-5 text-accent shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <address className="not-italic text-body text-bg-white/85">
                      {nap.address}
                      <br />
                      <span className="text-caption text-bg-white/60">
                        우편번호 {nap.postalCode}
                      </span>
                    </address>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone
                      className="w-5 h-5 text-accent shrink-0"
                      aria-hidden
                    />
                    <div>
                      <a
                        href={`tel:${nap.phone.replace(/-/g, "")}`}
                        className="text-body text-bg-white hover:text-accent transition-colors"
                      >
                        {nap.phoneDisplay}
                      </a>
                      <span className="mx-2 text-bg-white/30">|</span>
                      <span className="text-caption text-bg-white/60">
                        팩스 {nap.fax}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail
                      className="w-5 h-5 text-accent shrink-0"
                      aria-hidden
                    />
                    <a
                      href={`mailto:${nap.email}`}
                      className="text-body text-bg-white hover:text-accent transition-colors"
                    >
                      {nap.email}
                    </a>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="my-6 border-t border-bg-white/10" aria-hidden />

                {/* 영업시간 테이블 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-accent" aria-hidden />
                    <p className="text-caption font-semibold text-bg-white/80 uppercase tracking-wide">
                      영업시간
                    </p>
                  </div>
                  <table className="w-full text-body" aria-label="영업시간">
                    <tbody>
                      {HOURS.map(({ day, time }) => (
                        <tr key={day} className="border-b border-bg-white/10 last:border-0">
                          <td className="py-2 text-bg-white/70 w-28">
                            {day}
                          </td>
                          <td
                            className={
                              time === "휴무"
                                ? "py-2 text-bg-white/40"
                                : "py-2 text-bg-white font-medium"
                            }
                          >
                            {time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CTA 버튼 */}
                <div className="mt-7">
                  <Link
                    href="/reservation"
                    className={buttonStyles({
                      variant: "cta",
                      size: "lg",
                      fullWidth: true,
                    })}
                  >
                    상담 예약하기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
