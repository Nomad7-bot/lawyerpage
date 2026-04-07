-- ============================================================
-- 002: reservations 테이블 anon UPDATE 정책 추가
--      예약 취소/일정 변경 API에서 비로그인 사용자가
--      본인 예약을 수정할 수 있도록 허용
--      실제 인가(reservation_no + client_phone 검증)는
--      Route Handler 앱 코드에서 처리
-- ============================================================

CREATE POLICY "reservations: 예약자 본인 수정 가능"
  ON reservations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
