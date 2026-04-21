/**
 * 변호사 더미 데이터 (CMS 연동 전 샘플).
 * 원본 `dummy.ts` 에서 도메인별로 분리.
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
  {
    slug: "han-attorney",
    name: "한변호사",
    position: "변호사",
    specialties: ["기업", "형사"],
  },
];

// ── 변호사 상세 ──────────────────────────────
export type AttorneyDetail = AttorneyItem & {
  intro: string;
  bio: string;
  career: { year: string; title: string; desc: string }[];
  practiceAreas: { icon: LucideIcon; title: string; desc: string }[];
};

export const ATTORNEYS_DETAIL: Record<string, AttorneyDetail> = {
  "kim-daepyo": {
    slug: "kim-daepyo",
    name: "김대표",
    position: "대표변호사",
    specialties: ["민사", "기업법무"],
    intro: "의뢰인의 이야기에 귀 기울이고, 최선의 결과를 만들겠습니다.",
    bio: "20년 이상의 법조 경력을 바탕으로 민사소송과 기업법무 분야에서 탁월한 성과를 거두어 왔습니다. 판사 경력을 통해 쌓은 법리 분석 능력과 대형 로펌에서의 실무 경험을 결합하여, 의뢰인에게 명쾌하고 실용적인 법률 해결책을 제시합니다.",
    career: [
      {
        year: "2000",
        title: "서울대학교 법학과 졸업",
        desc: "법학 우등 졸업, 졸업 논문 우수상 수상",
      },
      {
        year: "2002",
        title: "제44회 사법시험 합격",
        desc: "사법연수원 수료 (제34기)",
      },
      {
        year: "2003 – 2008",
        title: "서울중앙지방법원 판사",
        desc: "민사·형사 재판부 근무, 판사로서 법리 적용 역량 강화",
      },
      {
        year: "2008 – 2015",
        title: "법무법인 서초 파트너변호사",
        desc: "기업법무·민사소송 분야 전문 변호사로 활동",
      },
      {
        year: "2015 – 현재",
        title: "법률사무소 창립·대표변호사",
        desc: "법률사무소를 설립하고 대표변호사로 활동 중",
      },
    ],
    practiceAreas: [
      {
        icon: Scale,
        title: "민사소송",
        desc: "채권채무, 손해배상, 계약분쟁 등 복잡한 민사 사건을 체계적으로 수행합니다.",
      },
      {
        icon: Building2,
        title: "기업법무",
        desc: "기업 설립부터 M&A, 계약 분쟁까지 기업 법률 리스크를 종합 관리합니다.",
      },
      {
        icon: Home,
        title: "부동산",
        desc: "매매·임대차·재건축 분쟁에서 의뢰인의 재산권을 보호합니다.",
      },
    ],
  },
  "lee-partner": {
    slug: "lee-partner",
    name: "이파트너",
    position: "파트너변호사",
    specialties: ["형사", "가사"],
    intro: "법의 정의로운 실현이 의뢰인에게 새로운 시작이 됩니다.",
    bio: "형사 변호와 가사 분쟁에서 탁월한 역량을 발휘합니다. 국선변호인 활동을 통해 다양한 형사 사건을 경험하였으며, 의뢰인의 처지에서 최선의 결과를 이끌어내는 것을 사명으로 삼고 있습니다. 섬세하고 꼼꼼한 사건 분석으로 신뢰받는 변호사입니다.",
    career: [
      {
        year: "2005",
        title: "고려대학교 법학전문대학원 입학",
        desc: "법학전문대학원 수료",
      },
      {
        year: "2012",
        title: "제2회 변호사시험 합격",
        desc: "변호사 자격 취득",
      },
      {
        year: "2012 – 2015",
        title: "국선변호인 활동",
        desc: "서울 소재 법원 국선변호인으로 다수 형사 사건 수행",
      },
      {
        year: "2015 – 현재",
        title: "법률사무소 파트너변호사",
        desc: "형사·가사 분야 전문 파트너변호사로 활동 중",
      },
    ],
    practiceAreas: [
      {
        icon: Gavel,
        title: "형사사건",
        desc: "수사부터 항소심까지 의뢰인의 방어권 보장을 최우선으로 변호합니다.",
      },
      {
        icon: Users,
        title: "가사·이혼",
        desc: "이혼, 재산분할, 친권·양육권 분쟁을 신중하고 섬세하게 풀어갑니다.",
      },
      {
        icon: Scale,
        title: "민사소송",
        desc: "손해배상, 계약분쟁 등 민사 사건에서 의뢰인의 권리를 수호합니다.",
      },
    ],
  },
  "park-attorney": {
    slug: "park-attorney",
    name: "박변호사",
    position: "파트너변호사",
    specialties: ["부동산", "민사"],
    intro: "복잡한 법률 문제도 명확하고 실용적인 해결책을 제시합니다.",
    bio: "부동산 및 민사소송 분야에서 다수의 성공 사례를 보유하고 있습니다. 부동산 전문 법무법인에서의 풍부한 실무 경험을 바탕으로, 복잡한 권리관계와 분쟁을 명확하게 분석하고 의뢰인의 재산권을 효과적으로 보호합니다.",
    career: [
      {
        year: "2008",
        title: "연세대학교 법학전문대학원 입학",
        desc: "법학전문대학원 수료",
      },
      {
        year: "2013",
        title: "제3회 변호사시험 합격",
        desc: "변호사 자격 취득",
      },
      {
        year: "2013 – 2018",
        title: "부동산 전문 법무법인 근무",
        desc: "부동산 거래, 임대차 분쟁, 경매 분야 전문 변호사로 활동",
      },
      {
        year: "2018 – 현재",
        title: "법률사무소 파트너변호사",
        desc: "부동산·민사 분야 전문 파트너변호사로 활동 중",
      },
    ],
    practiceAreas: [
      {
        icon: Home,
        title: "부동산",
        desc: "매매·임대차·재건축 등 부동산 거래와 분쟁 전반에 걸쳐 솔루션을 제공합니다.",
      },
      {
        icon: Scale,
        title: "민사소송",
        desc: "채권채무, 손해배상, 계약분쟁 등 민사 사건을 체계적으로 대응합니다.",
      },
      {
        icon: Building2,
        title: "기업법무",
        desc: "계약서 검토부터 기업 분쟁까지 기업법무 전반을 지원합니다.",
      },
    ],
  },
  "choi-attorney": {
    slug: "choi-attorney",
    name: "최변호사",
    position: "변호사",
    specialties: ["노동", "산재"],
    intro: "근로자의 권리를 끝까지 지키겠습니다.",
    bio: "노동 및 산재 분야에서 근로자의 권익 보호를 위해 헌신합니다. 노동 전문 법무법인에서의 경험을 바탕으로 부당해고, 임금 체불, 산업재해 인정 등 다양한 노동 사건에서 의뢰인에게 실질적인 구제책을 마련해 드립니다.",
    career: [
      {
        year: "2010",
        title: "성균관대학교 법학전문대학원 입학",
        desc: "법학전문대학원 수료",
      },
      {
        year: "2016",
        title: "제6회 변호사시험 합격",
        desc: "변호사 자격 취득",
      },
      {
        year: "2016 – 2022",
        title: "노동 전문 법무법인 근무",
        desc: "부당해고, 임금분쟁, 산재 인정 등 노동 사건 전문 변호사로 활동",
      },
      {
        year: "2022 – 현재",
        title: "법률사무소 변호사",
        desc: "노동·산재 분야 전문 변호사로 활동 중",
      },
    ],
    practiceAreas: [
      {
        icon: HardHat,
        title: "노동·산재",
        desc: "부당해고, 임금 체불, 산업재해 인정까지 근로자의 권리를 지켜냅니다.",
      },
      {
        icon: Scale,
        title: "민사소송",
        desc: "손해배상, 계약분쟁 등 민사 사건에서 의뢰인의 권리를 수호합니다.",
      },
      {
        icon: Gavel,
        title: "형사사건",
        desc: "근로 관계에서 발생하는 형사 사건을 전문적으로 변호합니다.",
      },
    ],
  },
  "han-attorney": {
    slug: "han-attorney",
    name: "한변호사",
    position: "변호사",
    specialties: ["기업", "형사"],
    intro: "기업법무와 형사 분야의 복잡한 문제를 명쾌하게 해결합니다.",
    bio: "기업법무와 형사 분야를 아우르는 복합적 역량을 보유하고 있습니다. 기업법무 전문 법무법인에서의 실무 경험을 바탕으로 기업 관련 형사 사건과 경제 범죄 분야에서 특화된 서비스를 제공합니다.",
    career: [
      {
        year: "2012",
        title: "한양대학교 법학전문대학원 입학",
        desc: "법학전문대학원 수료",
      },
      {
        year: "2018",
        title: "제8회 변호사시험 합격",
        desc: "변호사 자격 취득",
      },
      {
        year: "2018 – 2023",
        title: "기업법무 전문 법무법인 근무",
        desc: "기업 형사, 공정거래, M&A 관련 법무 분야 변호사로 활동",
      },
      {
        year: "2023 – 현재",
        title: "법률사무소 변호사",
        desc: "기업법무·형사 분야 전문 변호사로 활동 중",
      },
    ],
    practiceAreas: [
      {
        icon: Building2,
        title: "기업법무",
        desc: "기업 설립, 계약 검토, M&A부터 기업 분쟁까지 종합 기업법무를 지원합니다.",
      },
      {
        icon: Gavel,
        title: "형사사건",
        desc: "기업 형사 사건, 경제 범죄 등에서 의뢰인의 방어권을 보장합니다.",
      },
      {
        icon: Scale,
        title: "민사소송",
        desc: "기업·개인 간 민사분쟁에서 명확한 법리 분석으로 최선의 결과를 이끌어냅니다.",
      },
    ],
  },
};
