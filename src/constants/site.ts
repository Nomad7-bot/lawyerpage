/**
 * 사이트 기본 정보 (NAP - Name, Address, Phone)
 * PRD §4.4.3 GEO 최적화: 모든 페이지에서 동일하게 표시되어야 함
 */
export const SITE = {
  name: "법률사무소",
  shortName: "법무법인",
  description:
    "전문 변호사와 함께하는 신뢰할 수 있는 법률 상담. 형사, 민사, 가사, 기업법무 등 다양한 분야에서 최고의 법률 서비스를 제공합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // NAP 정보
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
 */
export const GNB_MENU = [
  { label: "소개", href: "/about" },
  { label: "업무분야", href: "/practice-areas" },
  { label: "변호사 소개", href: "/attorneys" },
  { label: "법률정보", href: "/insights" },
  { label: "상담 예약", href: "/reservation" },
  { label: "오시는 길", href: "/contact" },
] as const;
