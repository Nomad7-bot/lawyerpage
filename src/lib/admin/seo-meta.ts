/**
 * page_name → 한글 라벨 매핑 (UI 표시용, client/server 공용).
 * seed 에 정의된 7개 페이지만 매핑. 미매핑 키는 원문 반환.
 */
export const PAGE_LABELS: Record<string, string> = {
  home: "메인 페이지",
  about: "소개",
  "practice-areas": "업무분야",
  attorneys: "변호사",
  insights: "인사이트",
  reservation: "예약",
  contact: "오시는 길",
};

export function pageLabel(pageName: string): string {
  return PAGE_LABELS[pageName] ?? pageName;
}
