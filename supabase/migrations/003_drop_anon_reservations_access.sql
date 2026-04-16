-- reservations 테이블의 anon SELECT/UPDATE 정책 제거
--
-- 사유: 기존 정책은 qual/with_check 가 모두 `true` 로 설정되어 있어
-- NEXT_PUBLIC_SUPABASE_ANON_KEY 를 가진 누구나 PostgREST REST API 를 통해
-- 모든 예약 행을 조회/수정할 수 있었음 (본인 확인 우회 가능).
--
-- 대응: 서버 라우트(/api/reservations/*)를 SERVICE_ROLE_KEY 기반
-- admin client 로 전환하고, anon 역할에서 직접 접근하는 SELECT/UPDATE 경로를 차단.
-- INSERT 는 유지 — 현재 예약 생성은 admin client 로 이동했으나, 차후
-- 클라이언트 폼 직접 제출 경로로 전환할 여지를 남김.

DROP POLICY IF EXISTS "reservations: 예약번호+전화번호로 조회" ON public.reservations;
DROP POLICY IF EXISTS "reservations: 예약자 본인 수정 가능" ON public.reservations;
