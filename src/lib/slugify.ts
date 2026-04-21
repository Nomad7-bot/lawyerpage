/**
 * 간단한 slug 생성기 (client/server 공용).
 *
 * - 소문자 변환
 * - 유니코드 문자/숫자/공백/하이픈 외 제거 (한글은 유지)
 * - 연속 공백/하이픈 → 단일 하이픈
 *
 * 한글이 포함되면 URL 인코딩되어 유지됨 — Next.js 동적 라우트 정상 지원.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
