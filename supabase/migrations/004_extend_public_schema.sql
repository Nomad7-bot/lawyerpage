-- ============================================================
-- 법률사무소 홈페이지 — 공개 페이지 전환을 위한 스키마 확장
-- 파일: supabase/migrations/004_extend_public_schema.sql
-- 생성일: 2026-04-16
-- 설명: 공개 페이지의 더미 데이터(dummy.ts)를 DB로 이관하기 위해
--       기존 테이블에 부족한 컬럼을 추가한다.
--       - practice_areas: 주요 서비스 / 관련 사례
--       - attorneys    : 한 줄 소개 / 전문분야 상세 카드
--       - posts        : 읽기 시간 / 목차
--       - site_settings: 우편번호 / 주소 구성요소 / 전화 표시용
-- ============================================================


-- ============================================================
-- 1. practice_areas — 상세 페이지용 필드 추가
--    key_services : 상세 페이지의 "주요 업무 범위" 리스트
--    related_cases: 상세 페이지의 "관련 사례" 배열 (id/title/desc/result)
-- ============================================================

ALTER TABLE practice_areas
  ADD COLUMN key_services  TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN related_cases JSONB  NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN practice_areas.key_services  IS '주요 업무 범위 리스트 (예: ["채권·채무 분쟁", "손해배상청구 소송"])';
COMMENT ON COLUMN practice_areas.related_cases IS '관련 사례 배열. 형식: [{"id":"01","title":"...","desc":"...","result":"..."}]';


-- ============================================================
-- 2. attorneys — 상세 페이지용 필드 추가
--    intro              : 변호사 상세 페이지의 한 줄 소개 (큰따옴표 포함 가능)
--    practice_area_cards: 변호사 상세 페이지의 "전문분야" 3~4개 카드
--                         (attorney_practice_areas JOIN 과는 별개로,
--                          icon/title/desc 로 구성된 설명형 카드)
-- ============================================================

ALTER TABLE attorneys
  ADD COLUMN intro               VARCHAR(150),
  ADD COLUMN practice_area_cards JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN attorneys.intro               IS '변호사 한 줄 소개문 (예: "의뢰인의 권익을 최우선으로 합니다.")';
COMMENT ON COLUMN attorneys.practice_area_cards IS '상세 페이지의 전문분야 카드 배열. 형식: [{"icon_name":"Scale","title":"민사","desc":"..."}]';


-- ============================================================
-- 3. posts — 읽기 시간 / 목차 추가
--    reading_time: 예상 읽기 시간(분)
--    toc         : 본문 목차 배열 (id/title) — 사이드바 네비게이션용
-- ============================================================

ALTER TABLE posts
  ADD COLUMN reading_time INTEGER,
  ADD COLUMN toc          JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN posts.reading_time IS '예상 읽기 시간(분). NULL 허용.';
COMMENT ON COLUMN posts.toc          IS '본문 목차 배열. 형식: [{"id":"background","title":"배경"}]';


-- ============================================================
-- 4. site_settings — 주소 구성요소 / 전화 표시용 추가
--    postal_code      : 우편번호
--    address_region   : 광역(예: "서울특별시") — GEO SEO LocalBusiness schema용
--    address_locality : 시군구(예: "서초구")   — GEO SEO LocalBusiness schema용
--    phone_display    : 화면 표시용 전화(예: "02-0000-0000") — phone 은 발신용 원본
-- ============================================================

ALTER TABLE site_settings
  ADD COLUMN postal_code      VARCHAR(10),
  ADD COLUMN address_region   VARCHAR(50),
  ADD COLUMN address_locality VARCHAR(50),
  ADD COLUMN phone_display    VARCHAR(30);

COMMENT ON COLUMN site_settings.postal_code      IS '우편번호 (예: "06000")';
COMMENT ON COLUMN site_settings.address_region   IS '광역자치단체 (예: "서울특별시") — schema.org addressRegion';
COMMENT ON COLUMN site_settings.address_locality IS '기초자치단체 (예: "서초구") — schema.org addressLocality';
COMMENT ON COLUMN site_settings.phone_display    IS '화면 표시용 전화번호 (phone 은 tel: 링크 발신용 원본)';
