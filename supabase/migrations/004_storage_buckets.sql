-- ============================================================
-- 004: Supabase Storage 버킷 생성 + RLS 정책
-- ============================================================
--
-- 목적:
--   관리자 CMS 에서 업로드할 이미지 파일을 저장할 3개의 public 버킷을
--   정의하고, storage.objects 테이블에 bucket_id 기반 RLS 정책을 적용.
--
-- 버킷 구성:
--   attorneys : 변호사 프로필 사진     (public, 5MB,  jpeg/png/webp)
--   posts     : 게시글 썸네일/OG 이미지 (public, 10MB, jpeg/png/webp/gif)
--   seo       : 페이지별 OG 이미지      (public, 2MB,  jpeg/png)
--
-- RLS 정책:
--   SELECT : anon + authenticated    (버킷은 public 이지만 storage.objects
--                                     list/metadata 접근에는 명시적 정책 필요)
--   INSERT : authenticated 만       (관리자 로그인 필수)
--   UPDATE : authenticated 만       (upsert, metadata 수정)
--   DELETE : authenticated 만       (이미지 교체/삭제)
--
-- 멱등성:
--   버킷    → ON CONFLICT (id) DO NOTHING
--   정책    → DROP POLICY IF EXISTS 선행
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor 에 이 파일 전체를 붙여넣고 Run.
--   (CLI: supabase db push 도 가능하나 프로젝트 config 필요)
-- ============================================================


-- ------------------------------------------------------------
-- 1. 버킷 3개 생성
-- ------------------------------------------------------------

-- 변호사 프로필 (5 MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attorneys',
  'attorneys',
  true,
  5242880,  -- 5 * 1024 * 1024
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 게시글 썸네일 / OG 이미지 (10 MB, gif 포함)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  10485760,  -- 10 * 1024 * 1024
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 페이지별 OG 이미지 (2 MB, 가벼운 포맷만)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seo',
  'seo',
  true,
  2097152,  -- 2 * 1024 * 1024
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 2. storage.objects RLS 정책
--    3개 버킷 모두 동일 패턴 → bucket_id IN (...) 로 단일 정책
-- ------------------------------------------------------------

-- SELECT: 누구나 조회 가능 (public 이미지)
DROP POLICY IF EXISTS "storage.objects: 업로드 이미지 누구나 조회" ON storage.objects;
CREATE POLICY "storage.objects: 업로드 이미지 누구나 조회"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('attorneys', 'posts', 'seo'));

-- INSERT: 인증 사용자(관리자)만 업로드
DROP POLICY IF EXISTS "storage.objects: 인증 사용자만 이미지 업로드" ON storage.objects;
CREATE POLICY "storage.objects: 인증 사용자만 이미지 업로드"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('attorneys', 'posts', 'seo'));

-- UPDATE: 인증 사용자만 수정 (upsert, 메타데이터 변경)
DROP POLICY IF EXISTS "storage.objects: 인증 사용자만 이미지 수정" ON storage.objects;
CREATE POLICY "storage.objects: 인증 사용자만 이미지 수정"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('attorneys', 'posts', 'seo'))
  WITH CHECK (bucket_id IN ('attorneys', 'posts', 'seo'));

-- DELETE: 인증 사용자만 삭제 (이미지 교체 시)
DROP POLICY IF EXISTS "storage.objects: 인증 사용자만 이미지 삭제" ON storage.objects;
CREATE POLICY "storage.objects: 인증 사용자만 이미지 삭제"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('attorneys', 'posts', 'seo'));
