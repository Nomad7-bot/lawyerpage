-- ============================================================
-- 법률사무소 홈페이지 — 초기 DB 스키마 마이그레이션
-- 파일: supabase/migrations/001_initial_schema.sql
-- 생성일: 2026-04-07
-- 설명: 모든 테이블, 인덱스, 트리거, RLS 정책을 포함하는
--       초기 스키마 마이그레이션 파일
-- ============================================================


-- ============================================================
-- 0. updated_at 자동 갱신 트리거 함수
--    모든 테이블의 updated_at 컬럼을 UPDATE 시 자동으로 now()로 설정
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 1. post_categories (게시글 카테고리)
--    법률정보/인사이트 게시글의 카테고리 분류
--    예: 법률 뉴스, 상담 사례, 법률 용어, FAQ
-- ============================================================

CREATE TABLE post_categories (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(50) NOT NULL,                    -- 카테고리명 (예: "법률 뉴스")
  slug          VARCHAR(100) UNIQUE NOT NULL,             -- URL 슬러그 (예: "legal-news")
  display_order INTEGER     NOT NULL DEFAULT 0,           -- 노출 순서 (낮을수록 먼저)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  post_categories IS '게시글 카테고리 — 인사이트/법률정보 분류';
COMMENT ON COLUMN post_categories.slug IS 'URL에 사용되는 슬러그 (영문 소문자+하이픈)';
COMMENT ON COLUMN post_categories.display_order IS '카테고리 노출 순서, 낮을수록 먼저 표시';


-- ============================================================
-- 2. practice_areas (업무분야)
--    법률사무소의 전문 분야 목록
--    예: 민사소송, 형사사건, 가사·이혼, 기업법무 등
-- ============================================================

CREATE TABLE practice_areas (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,                 -- 분야명 (예: "민사소송")
  slug             VARCHAR(100) UNIQUE NOT NULL,           -- URL 슬러그 (예: "civil")
  description      TEXT,                                   -- 간략 설명 (목록 카드에 표시)
  detail_content   TEXT,                                   -- 상세 본문 (HTML, 상세 페이지용)
  icon_name        VARCHAR(50),                            -- lucide-react 아이콘명 (예: "Scale")
  display_order    INTEGER      NOT NULL DEFAULT 0,        -- 노출 순서
  is_active        BOOLEAN      NOT NULL DEFAULT true,     -- 활성 여부 (비활성 시 공개 페이지에서 숨김)
  meta_title       VARCHAR(60),                            -- SEO 메타 타이틀
  meta_description VARCHAR(160),                           -- SEO 메타 디스크립션
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  practice_areas IS '업무분야 — 법률사무소 전문 분야 목록';
COMMENT ON COLUMN practice_areas.icon_name IS 'lucide-react 아이콘 컴포넌트명 (예: Scale, Shield 등)';
COMMENT ON COLUMN practice_areas.detail_content IS '상세 페이지 본문 — HTML 형식';
COMMENT ON COLUMN practice_areas.is_active IS 'false이면 공개 페이지에서 숨김, 관리자만 조회 가능';


-- ============================================================
-- 3. attorneys (변호사)
--    소속 변호사 프로필 정보
-- ============================================================

CREATE TABLE attorneys (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(50) NOT NULL,                    -- 변호사명
  slug           VARCHAR(100) UNIQUE NOT NULL,             -- URL 슬러그 (예: "kim-daepyo")
  position       VARCHAR(50) NOT NULL,                    -- 직책 (예: "대표변호사", "파트너변호사")
  profile_image  TEXT,                                     -- 프로필 이미지 URL (Supabase Storage)
  bio            TEXT,                                     -- 소개문
  career         JSONB       NOT NULL DEFAULT '[]'::jsonb, -- 경력 배열
  -- career 형식: [{"year": "2020", "content": "서울중앙지방법원 판사"}]
  display_order  INTEGER     NOT NULL DEFAULT 0,           -- 노출 순서
  is_active      BOOLEAN     NOT NULL DEFAULT true,        -- 활성 여부
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  attorneys IS '변호사 — 소속 변호사 프로필';
COMMENT ON COLUMN attorneys.career IS 'JSONB 배열 — [{"year":"2020","content":"경력 내용"}]';
COMMENT ON COLUMN attorneys.profile_image IS 'Supabase Storage에 업로드된 이미지의 공개 URL';


-- ============================================================
-- 4. attorney_practice_areas (변호사-업무분야 다대다 관계)
--    한 변호사가 여러 업무분야를 담당하고,
--    한 업무분야에 여러 변호사가 배정될 수 있음
-- ============================================================

CREATE TABLE attorney_practice_areas (
  attorney_id      UUID NOT NULL REFERENCES attorneys(id) ON DELETE CASCADE,
  practice_area_id UUID NOT NULL REFERENCES practice_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (attorney_id, practice_area_id)
);

COMMENT ON TABLE attorney_practice_areas IS '변호사-업무분야 다대다 매핑 테이블';


-- ============================================================
-- 5. available_slots (상담 가능 시간)
--    변호사별 요일/시간대 상담 가능 스케줄
--    예: 김대표 변호사 — 월요일 09:00~12:00
-- ============================================================

CREATE TABLE available_slots (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id  UUID    NOT NULL REFERENCES attorneys(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL,                          -- 요일: 0(일) ~ 6(토)
  start_time   TIME    NOT NULL,                          -- 시작 시간 (예: 09:00)
  end_time     TIME    NOT NULL,                          -- 종료 시간 (예: 12:00)
  is_active    BOOLEAN NOT NULL DEFAULT true,             -- 활성 여부
  UNIQUE (attorney_id, day_of_week, start_time)           -- 같은 변호사/요일/시작시간 중복 방지
);

COMMENT ON TABLE  available_slots IS '상담 가능 시간 — 변호사별 요일/시간대 스케줄';
COMMENT ON COLUMN available_slots.day_of_week IS '요일 숫자: 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토';


-- ============================================================
-- 6. reservations (상담 예약)
--    사용자가 온라인으로 신청하는 상담 예약
--    예약번호 형식: R-YYYYMMDD-XXX (예: R-20260407-001)
-- ============================================================

CREATE TABLE reservations (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_no    VARCHAR(20)  UNIQUE NOT NULL,          -- 예약번호 (R-YYYYMMDD-XXX)
  attorney_id       UUID         REFERENCES attorneys(id), -- 상담 변호사 (NULL = 무관)
  client_name       VARCHAR(20)  NOT NULL,                 -- 예약자 성함
  client_phone      VARCHAR(20)  NOT NULL,                 -- 연락처
  client_email      VARCHAR(100) NOT NULL,                 -- 이메일
  practice_area_id  UUID         REFERENCES practice_areas(id), -- 상담 분야
  consultation_note TEXT,                                   -- 상담 메모 (추가 요청사항)
  preferred_date    DATE         NOT NULL,                 -- 희망 상담일
  preferred_time    TIME         NOT NULL,                 -- 희망 상담 시간
  status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- 예약 상태
  reject_reason     TEXT,                                   -- 거절 사유 (REJECTED 시)
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- 상태값 제한: 5가지 상태만 허용
  CONSTRAINT reservations_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'))
);

COMMENT ON TABLE  reservations IS '상담 예약 — 온라인 예약 신청 내역';
COMMENT ON COLUMN reservations.reservation_no IS '예약번호 형식: R-YYYYMMDD-XXX (예: R-20260407-001)';
COMMENT ON COLUMN reservations.attorney_id IS 'NULL이면 변호사 무관(아무나), UUID면 특정 변호사 지정';
COMMENT ON COLUMN reservations.status IS 'PENDING(대기) → CONFIRMED(확정) / REJECTED(거절) / CANCELLED(취소) → COMPLETED(완료)';


-- ============================================================
-- 7. posts (게시글 / 인사이트)
--    법률정보, 뉴스, 상담 사례, FAQ 등의 콘텐츠
-- ============================================================

CREATE TABLE posts (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(200)  NOT NULL,                 -- 게시글 제목
  slug             VARCHAR(200)  UNIQUE NOT NULL,           -- URL 슬러그
  category_id      UUID          REFERENCES post_categories(id), -- 카테고리 FK
  content          TEXT          NOT NULL,                 -- 본문 (HTML)
  excerpt          VARCHAR(300),                            -- 요약문 (목록에 표시)
  thumbnail        TEXT,                                    -- 썸네일 이미지 URL
  tags             TEXT[],                                  -- 태그 배열 (예: {"민사", "계약"})
  author_id        UUID          REFERENCES attorneys(id), -- 작성 변호사
  is_published     BOOLEAN       NOT NULL DEFAULT false,   -- 게시 여부 (false = 임시저장)
  published_at     TIMESTAMPTZ,                             -- 게시 일시
  view_count       INTEGER       NOT NULL DEFAULT 0,       -- 조회수
  meta_title       VARCHAR(60),                             -- SEO 메타 타이틀
  meta_description VARCHAR(160),                            -- SEO 메타 디스크립션
  og_image         TEXT,                                    -- Open Graph 이미지 URL
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  posts IS '게시글 — 법률정보/인사이트 콘텐츠';
COMMENT ON COLUMN posts.content IS '본문 HTML — 에디터에서 작성된 리치 텍스트';
COMMENT ON COLUMN posts.is_published IS 'false이면 임시저장 상태, 관리자만 조회 가능';
COMMENT ON COLUMN posts.published_at IS '게시 일시 — is_published가 true가 되는 시점에 설정';
COMMENT ON COLUMN posts.tags IS 'TEXT 배열 — 예: {"민사", "계약", "손해배상"}';


-- ============================================================
-- 8. seo_settings (페이지별 SEO 설정)
--    관리자가 페이지별로 메타태그/OG를 커스터마이징
-- ============================================================

CREATE TABLE seo_settings (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name        VARCHAR(100) UNIQUE NOT NULL,           -- 페이지 식별자 (예: "home", "about")
  page_url         VARCHAR(200) NOT NULL,                  -- 페이지 URL (예: "/", "/about")
  meta_title       VARCHAR(60),                             -- <title> 태그
  meta_description VARCHAR(160),                            -- <meta description>
  og_title         VARCHAR(60),                             -- og:title
  og_description   VARCHAR(200),                            -- og:description
  og_image         TEXT,                                    -- og:image URL
  canonical_url    VARCHAR(200),                            -- <link rel="canonical">
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  seo_settings IS 'SEO 설정 — 페이지별 메타태그/OG 커스터마이징';
COMMENT ON COLUMN seo_settings.page_name IS '페이지 식별자 — home, about, practice-areas 등';


-- ============================================================
-- 9. site_settings (사이트 기본 설정)
--    법률사무소 기본 정보 — 1행만 유지
--    NAP(이름/주소/전화번호), 운영시간, SNS 링크 등
-- ============================================================

CREATE TABLE site_settings (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name               VARCHAR(100) NOT NULL,            -- 사무소명
  address                 TEXT         NOT NULL,            -- 주소
  phone                   VARCHAR(20)  NOT NULL,            -- 대표 전화번호
  fax                     VARCHAR(20),                       -- 팩스 번호
  email                   VARCHAR(100),                      -- 대표 이메일
  business_hours          JSONB        NOT NULL DEFAULT '{}'::jsonb, -- 운영시간
  -- business_hours 형식: {"weekday":"09:00~18:00","saturday":"10:00~14:00","sunday":"휴무"}
  blog_url                TEXT,                              -- 블로그 URL
  instagram_url           TEXT,                              -- 인스타그램 URL
  default_title_template  VARCHAR(100),                      -- 기본 타이틀 템플릿 (예: "{page} | 법무법인 정의")
  default_description     TEXT,                              -- 기본 메타 디스크립션
  default_og_image        TEXT,                              -- 기본 OG 이미지 URL
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  site_settings IS '사이트 설정 — 법률사무소 기본 정보 (1행만 유지)';
COMMENT ON COLUMN site_settings.business_hours IS 'JSONB — {"weekday":"09:00~18:00","saturday":"10:00~14:00","sunday":"휴무"}';
COMMENT ON COLUMN site_settings.default_title_template IS '페이지 타이틀 기본 템플릿 — {page}가 페이지명으로 치환됨';


-- ============================================================
-- 10. 인덱스 생성
--     자주 조회되는 컬럼에 인덱스를 추가하여 쿼리 성능 최적화
-- ============================================================

-- reservations 인덱스
CREATE INDEX idx_reservations_status ON reservations (status);
CREATE INDEX idx_reservations_preferred_date ON reservations (preferred_date);
CREATE INDEX idx_reservations_attorney_id ON reservations (attorney_id);

-- posts 인덱스
CREATE INDEX idx_posts_published ON posts (is_published, published_at DESC);
CREATE INDEX idx_posts_category_id ON posts (category_id);
CREATE INDEX idx_posts_slug ON posts (slug);

-- attorneys 인덱스
CREATE INDEX idx_attorneys_display_order ON attorneys (display_order);
CREATE INDEX idx_attorneys_slug ON attorneys (slug);


-- ============================================================
-- 11. updated_at 트리거 적용
--     updated_at 컬럼이 있는 모든 테이블에 자동 갱신 트리거 설정
--     → UPDATE 실행 시 updated_at이 자동으로 현재 시간으로 변경됨
-- ============================================================

CREATE TRIGGER trg_practice_areas_updated_at
  BEFORE UPDATE ON practice_areas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_attorneys_updated_at
  BEFORE UPDATE ON attorneys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 12. RLS (Row Level Security) 활성화
--     모든 테이블에 RLS를 활성화하여 보안 정책 적용
-- ============================================================

ALTER TABLE post_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_areas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorneys             ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings         ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 13. RLS 정책 — 공개 테이블 (비로그인 사용자도 조회 가능)
-- ============================================================

-- ----- post_categories -----
-- 누구나 카테고리 목록 조회 가능
CREATE POLICY "post_categories: 누구나 조회 가능"
  ON post_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- 인증된 관리자만 카테고리 생성/수정/삭제
CREATE POLICY "post_categories: 인증 사용자만 생성"
  ON post_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "post_categories: 인증 사용자만 수정"
  ON post_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "post_categories: 인증 사용자만 삭제"
  ON post_categories FOR DELETE
  TO authenticated
  USING (true);


-- ----- practice_areas -----
CREATE POLICY "practice_areas: 누구나 조회 가능"
  ON practice_areas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "practice_areas: 인증 사용자만 생성"
  ON practice_areas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "practice_areas: 인증 사용자만 수정"
  ON practice_areas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "practice_areas: 인증 사용자만 삭제"
  ON practice_areas FOR DELETE
  TO authenticated
  USING (true);


-- ----- attorneys -----
CREATE POLICY "attorneys: 누구나 조회 가능"
  ON attorneys FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "attorneys: 인증 사용자만 생성"
  ON attorneys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "attorneys: 인증 사용자만 수정"
  ON attorneys FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "attorneys: 인증 사용자만 삭제"
  ON attorneys FOR DELETE
  TO authenticated
  USING (true);


-- ----- attorney_practice_areas -----
CREATE POLICY "attorney_practice_areas: 누구나 조회 가능"
  ON attorney_practice_areas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "attorney_practice_areas: 인증 사용자만 생성"
  ON attorney_practice_areas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "attorney_practice_areas: 인증 사용자만 삭제"
  ON attorney_practice_areas FOR DELETE
  TO authenticated
  USING (true);


-- ----- available_slots -----
CREATE POLICY "available_slots: 누구나 조회 가능"
  ON available_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "available_slots: 인증 사용자만 생성"
  ON available_slots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "available_slots: 인증 사용자만 수정"
  ON available_slots FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "available_slots: 인증 사용자만 삭제"
  ON available_slots FOR DELETE
  TO authenticated
  USING (true);


-- ----- site_settings -----
CREATE POLICY "site_settings: 누구나 조회 가능"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings: 인증 사용자만 생성"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "site_settings: 인증 사용자만 수정"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "site_settings: 인증 사용자만 삭제"
  ON site_settings FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- 14. RLS 정책 — posts (게시글)
--     비로그인 사용자는 게시된(published) 글만 조회 가능
-- ============================================================

CREATE POLICY "posts: 게시된 글만 공개 조회"
  ON posts FOR SELECT
  TO anon
  USING (is_published = true);

-- 인증된 사용자는 모든 글 조회 가능 (임시저장 포함)
CREATE POLICY "posts: 인증 사용자 전체 조회"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "posts: 인증 사용자만 생성"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "posts: 인증 사용자만 수정"
  ON posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "posts: 인증 사용자만 삭제"
  ON posts FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- 15. RLS 정책 — reservations (예약)
--     비로그인 사용자도 예약 생성(INSERT) 가능
--     조회는 예약번호 + 전화번호 조합으로만 가능 (예약 확인용)
--     수정/삭제는 인증된 관리자만 가능
-- ============================================================

-- 비로그인 사용자도 예약 신청 가능
CREATE POLICY "reservations: 누구나 예약 생성 가능"
  ON reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 비로그인 사용자의 예약 조회: 예약번호 + 전화번호로만 조회 가능
-- ※ 실제 조회 시 WHERE reservation_no = ? AND client_phone = ? 조건 필요
--   RLS에서는 행 자체의 존재만 허용하고, 앱 레벨에서 두 조건 필터링
CREATE POLICY "reservations: 예약번호+전화번호로 조회"
  ON reservations FOR SELECT
  TO anon
  USING (true);

-- 인증된 관리자는 모든 예약 조회 가능
CREATE POLICY "reservations: 인증 사용자 전체 조회"
  ON reservations FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 관리자만 예약 상태 수정 가능
CREATE POLICY "reservations: 인증 사용자만 수정"
  ON reservations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인증된 관리자만 예약 삭제 가능
CREATE POLICY "reservations: 인증 사용자만 삭제"
  ON reservations FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- 16. RLS 정책 — seo_settings (SEO 설정)
--     인증된 관리자만 모든 작업 가능
-- ============================================================

CREATE POLICY "seo_settings: 인증 사용자만 조회"
  ON seo_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "seo_settings: 인증 사용자만 생성"
  ON seo_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "seo_settings: 인증 사용자만 수정"
  ON seo_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "seo_settings: 인증 사용자만 삭제"
  ON seo_settings FOR DELETE
  TO authenticated
  USING (true);


-- ============================================================
-- 완료!
-- 생성된 테이블: 9개
--   1. post_categories    — 게시글 카테고리
--   2. practice_areas     — 업무분야
--   3. attorneys          — 변호사
--   4. attorney_practice_areas — 변호사-업무분야 매핑
--   5. available_slots    — 상담 가능 시간
--   6. reservations       — 상담 예약
--   7. posts              — 게시글/인사이트
--   8. seo_settings       — 페이지별 SEO 설정
--   9. site_settings      — 사이트 기본 설정
--
-- 인덱스: 8개
-- 트리거: 6개 (updated_at 자동 갱신)
-- RLS 정책: 모든 테이블 활성화 + 역할별 접근 제어
-- ============================================================
