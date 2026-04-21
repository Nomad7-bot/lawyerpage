/**
 * 더미 데이터 집계 파일 (CMS 연동 전 샘플).
 *
 * 도메인별로 `practice-areas.ts`, `attorneys.ts`, `insights.ts` 로 분리되었으며,
 * 이 파일은 기존 `@/constants/dummy` 경로의 호환성을 유지하는 re-export 허브다.
 * 신규 코드는 가능한 한 도메인 파일에서 직접 import 하는 것을 권장한다.
 */
export * from "./practice-areas";
export * from "./attorneys";
export * from "./insights";
