/**
 * 사이트 기본 정보 및 글로벌 네비게이션 상수.
 *
 * 공개 페이지(메인/업무분야/변호사/법률정보/오시는길, 그리고 (public)/layout.tsx)
 * 는 모두 DB(site_settings)에서 NAP(상호·주소·전화·영업시간) 를 조회하도록
 * 전환되었다. 따라서 공개 페이지에서는 `SITE.nap` / `SITE.businessHours` 를
 * 더 이상 참조하지 않는다.
 *
 * 다만 예약 API(/api/reservations/*) 와 이메일 템플릿(lib/email-templates.ts),
 * 그리고 Header / FloatingCTA 같은 일부 레이아웃 컴포넌트는 아직 이 상수를
 * 참조하고 있어 레거시 호환용으로 값을 유지한다 — Phase 3 에서 동일하게
 * `getSiteSettings()` 로 교체 예정.
 *
 * **변경 원칙**: NAP 값을 수정할 때는 반드시 DB 의 `site_settings` 행을
 * 함께 갱신해야 한다 (이중 진실 소스 충돌 방지).
 */
export const SITE = {
  name: "법률사무소",
  shortName: "법무법인",
  description:
    "전문 변호사와 함께하는 신뢰할 수 있는 법률 상담. 형사, 민사, 가사, 기업법무 등 다양한 분야에서 최고의 법률 서비스를 제공합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // NAP 정보 — Phase 3 이관 대기 (예약 API/이메일 템플릿/Header/FloatingCTA 레거시 참조)
  nap: {
    name: "법률사무소",
    address: "서울특별시 서초구 서초대로 000, 00빌딩 00층",
    addressRegion: "서울특별시",
    addressLocality: "서초구",
    postalCode: "06000",
    phone: "02-0000-0000",
    phoneDisplay: "02-0000-0000",
    fax: "02-0000-0001",
    email: "contact@lawfirm.example.com",
  },
  businessHours: {
    weekday: "09:00 - 18:00",
    saturday: "09:00 - 13:00",
    sunday: "휴무",
  },
} as const;

/**
 * 글로벌 네비게이션 메뉴 (PRD §3.1 사이트맵)
 * 정적 라우트이므로 DB 에 저장하지 않는다.
 */
export const GNB_MENU = [
  { label: "소개", href: "/about" },
  { label: "업무분야", href: "/practice-areas" },
  { label: "변호사 소개", href: "/attorneys" },
  { label: "법률정보", href: "/insights" },
  { label: "상담 예약", href: "/reservation" },
  { label: "오시는 길", href: "/contact" },
] as const;
