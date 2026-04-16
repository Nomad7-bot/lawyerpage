/**
 * 상담분야 선택 옵션 (예약 폼의 클라이언트 사이드 기본값)
 * 실제 조회·예약 저장 시에는 Supabase practice_areas 테이블을
 * usePracticeAreas() 훅으로 불러와 사용한다.
 * 이 상수는 API 실패 시 폴백 / 레거시 호환용으로만 유지.
 */
export const TOPIC_OPTIONS = [
  { value: "민사소송", label: "민사소송" },
  { value: "형사사건", label: "형사사건" },
  { value: "가사·이혼", label: "가사·이혼" },
  { value: "기업법무", label: "기업법무" },
  { value: "부동산", label: "부동산" },
  { value: "노동·산재", label: "노동·산재" },
] as const;

export type TopicValue = (typeof TOPIC_OPTIONS)[number]["value"];
