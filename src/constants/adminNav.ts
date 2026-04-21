import {
  Briefcase,
  CalendarCheck,
  ExternalLink,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * 관리자 사이드바 네비게이션 데이터
 *
 * - 공개 페이지 GNB_MENU (src/constants/site.ts) 와 역할 분리
 * - 각 항목의 icon 은 lucide-react 컴포넌트 (type: LucideIcon)
 * - children 이 있으면 사이드바에서 expandable 로 렌더
 * - match.searchParam 이 있으면 pathname + 쿼리 파라미터까지 비교해 active 판정
 *   (예: /admin/contents?tab=posts 에서 "법률정보" 자식 active)
 */

export type AdminNavSubItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** active 판정 시 쿼리 파라미터까지 매치 (예: ?tab=posts) */
  match?: {
    searchParam?: { key: string; value: string };
  };
};

export type AdminNavItem = AdminNavSubItem & {
  /** 하위 메뉴 (있으면 expandable) */
  children?: ReadonlyArray<AdminNavSubItem>;
  /** 새 탭 열기 (외부 / 공개 페이지 링크용) */
  external?: boolean;
};

/**
 * 상단 주요 메뉴
 */
export const ADMIN_MENU: ReadonlyArray<AdminNavItem> = [
  {
    label: "대시보드",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "예약 관리",
    href: "/admin/reservations",
    icon: CalendarCheck,
  },
  {
    label: "콘텐츠 관리",
    href: "/admin/contents",
    icon: FolderOpen,
    children: [
      {
        label: "법률정보",
        href: "/admin/contents?tab=posts",
        icon: FileText,
        match: { searchParam: { key: "tab", value: "posts" } },
      },
      {
        label: "변호사 관리",
        href: "/admin/contents?tab=attorneys",
        icon: Users,
        match: { searchParam: { key: "tab", value: "attorneys" } },
      },
      {
        label: "업무분야",
        href: "/admin/contents?tab=practice-areas",
        icon: Briefcase,
        match: { searchParam: { key: "tab", value: "practice-areas" } },
      },
    ],
  },
  {
    label: "SEO 설정",
    href: "/admin/seo",
    icon: Search,
  },
];

/**
 * 구분선 아래 외부/보조 메뉴
 */
export const ADMIN_EXTERNAL_MENU: ReadonlyArray<AdminNavItem> = [
  {
    label: "홈페이지 보기",
    href: "/",
    icon: ExternalLink,
    external: true,
  },
];

/**
 * 헤더 페이지 제목 매핑
 * - pathname 기반으로 현재 페이지 제목을 결정
 * - 매핑되지 않은 경로는 fallback "관리자" 사용
 */
export const ADMIN_PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "대시보드",
  "/admin/reservations": "예약 관리",
  "/admin/contents": "콘텐츠 관리",
  "/admin/seo": "SEO 설정",
};
