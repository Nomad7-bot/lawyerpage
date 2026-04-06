/**
 * 상담분야 선택 옵션
 * PRACTICE_AREAS(dummy.ts)와 동일한 분류를 유지합니다.
 * Phase 2: Supabase practice_areas 테이블에서 동적으로 조회하도록 교체
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
