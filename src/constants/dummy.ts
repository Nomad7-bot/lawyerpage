/**
 * 메인 페이지 더미 데이터
 * CMS(Supabase) 연동 전까지 임시로 사용하는 샘플 데이터
 */
import {
  Scale,
  Gavel,
  Users,
  Building2,
  Home,
  HardHat,
  type LucideIcon,
} from "lucide-react";

// ── 업무분야 ──────────────────────────────
export type PracticeAreaItem = {
  slug: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export const PRACTICE_AREAS: PracticeAreaItem[] = [
  {
    slug: "civil",
    icon: Scale,
    title: "민사소송",
    description:
      "채권채무, 손해배상, 계약분쟁 등 복잡한 민사 사건을 체계적으로 대응합니다.",
  },
  {
    slug: "criminal",
    icon: Gavel,
    title: "형사사건",
    description:
      "수사 초기부터 재판까지 의뢰인의 방어권 보장을 최우선으로 변호합니다.",
  },
  {
    slug: "family",
    icon: Users,
    title: "가사·이혼",
    description:
      "이혼, 재산분할, 친권·양육권 분쟁을 신중하고 섬세하게 풀어갑니다.",
  },
  {
    slug: "corporate",
    icon: Building2,
    title: "기업법무",
    description:
      "자문, 계약 검토, 분쟁 대응까지 기업의 법률 리스크를 종합 관리합니다.",
  },
  {
    slug: "real-estate",
    icon: Home,
    title: "부동산",
    description:
      "매매·임대차·재건축 등 부동산 거래와 분쟁 전반에 걸쳐 실무 솔루션을 제공합니다.",
  },
  {
    slug: "labor",
    icon: HardHat,
    title: "노동·산재",
    description:
      "부당해고, 임금 체불, 산업재해 인정까지 근로자의 권리를 지켜냅니다.",
  },
];

// ── 변호사 ──────────────────────────────
export type AttorneyItem = {
  slug: string;
  name: string;
  position: string;
  specialties: string[];
};

export const ATTORNEYS: AttorneyItem[] = [
  {
    slug: "kim-daepyo",
    name: "김대표",
    position: "대표변호사",
    specialties: ["민사", "기업법무"],
  },
  {
    slug: "lee-partner",
    name: "이파트너",
    position: "파트너변호사",
    specialties: ["형사", "가사"],
  },
  {
    slug: "park-attorney",
    name: "박변호사",
    position: "파트너변호사",
    specialties: ["부동산", "민사"],
  },
  {
    slug: "choi-attorney",
    name: "최변호사",
    position: "변호사",
    specialties: ["노동", "산재"],
  },
];

// ── 법률정보 ──────────────────────────────
export type InsightItem = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO 문자열
};

export const INSIGHTS: InsightItem[] = [
  {
    slug: "divorce-property-division-2026",
    category: "가사",
    title: "2026년 이혼 재산분할 기준, 이렇게 달라졌습니다",
    excerpt:
      "최근 대법원 판례를 중심으로 부부 공동재산의 분할 기준과 기여도 산정 방식이 어떻게 변하고 있는지 정리했습니다.",
    publishedAt: "2026-03-20",
  },
  {
    slug: "lease-protection-act-guide",
    category: "부동산",
    title: "상가임대차보호법 개정, 임차인이 꼭 알아야 할 3가지",
    excerpt:
      "계약갱신요구권, 권리금 회수기회, 차임 증액 한도 — 개정 법률의 핵심 쟁점을 실무 사례와 함께 살펴봅니다.",
    publishedAt: "2026-03-05",
  },
  {
    slug: "corporate-compliance-checklist",
    category: "기업",
    title: "중소기업을 위한 법적 리스크 체크리스트 10",
    excerpt:
      "계약서 관리부터 노무, 개인정보, 공정거래까지 중소기업 대표가 반드시 점검해야 할 법률 리스크를 정리했습니다.",
    publishedAt: "2026-02-18",
  },
];
