"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Supabase Storage 업로드 유틸리티
 *
 * - 브라우저 전용 (File 객체 사용 — Server Component 에서 import 금지)
 * - 인증된 세션에서만 업로드 가능 (storage.objects RLS)
 * - 파일명은 crypto.randomUUID() + 확장자 → 한글/중복 충돌 원천 차단
 */

export type StorageBucket = "attorneys" | "posts" | "seo";

export type UploadResult =
  | { success: true; publicUrl: string; path: string }
  | { success: false; error: string };

export type DeleteResult = { success: true } | { success: false; error: string };

/**
 * 버킷별 기본 제한값
 * 004_storage_buckets.sql 의 file_size_limit / allowed_mime_types 와 동일하게 유지
 */
export const BUCKET_DEFAULTS: Record<
  StorageBucket,
  { maxSize: number; accept: string[] }
> = {
  attorneys: {
    maxSize: 5 * 1024 * 1024,
    accept: ["image/jpeg", "image/png", "image/webp"],
  },
  posts: {
    maxSize: 10 * 1024 * 1024,
    accept: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  seo: {
    maxSize: 2 * 1024 * 1024,
    accept: ["image/jpeg", "image/png"],
  },
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXTENSIONS.has(fromName)) return fromName;
  // MIME → ext 폴백
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

/**
 * 업로드 에러 메시지를 한국어 UI 문구로 매핑
 */
function mapUploadError(error: unknown, bucket: StorageBucket): string {
  const msg =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (msg.includes("payload too large") || msg.includes("413")) {
    const mb = Math.round(BUCKET_DEFAULTS[bucket].maxSize / (1024 * 1024));
    return `파일이 너무 큽니다. ${mb}MB 이하로 준비해주세요`;
  }
  if (msg.includes("403") || msg.includes("row-level security")) {
    return "업로드 권한이 없습니다. 다시 로그인해주세요";
  }
  if (msg.includes("409") || msg.includes("duplicate") || msg.includes("already exists")) {
    return "동일한 파일이 이미 존재합니다";
  }
  if (msg.includes("mime") || msg.includes("invalid")) {
    return "허용되지 않는 파일 형식입니다";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
  }
  return "업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요";
}

/**
 * 이미지를 Supabase Storage 에 업로드하고 public URL 을 반환
 *
 * @param bucket      버킷 이름
 * @param file        업로드할 File 객체
 * @param pathPrefix  버킷 내부 폴더 (예: 'thumbnails'). 생략 시 루트
 *
 * 주의:
 *   - 파일 크기/타입 검증은 호출 측(ImageUploader)에서 선행
 *     이 함수는 Supabase 서버 응답만 신뢰
 *   - 파일명은 항상 랜덤 UUID 로 재작성
 */
export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  pathPrefix?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient();

    const ext = getExtension(file);
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const fullPath = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: "31536000", // 1년 — UUID 파일명이라 불변
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[storage] upload error:", error);
      return { success: false, error: mapUploadError(error, bucket) };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fullPath);

    return {
      success: true,
      publicUrl: data.publicUrl,
      path: fullPath,
    };
  } catch (err) {
    console.error("[storage] upload exception:", err);
    return { success: false, error: mapUploadError(err, bucket) };
  }
}

/**
 * 기존 이미지 삭제 (프로필 교체 등)
 *
 * @param bucket  버킷 이름
 * @param path    bucket 내부 경로 (예: 'thumbnails/uuid.jpg')
 */
export async function deleteImage(
  bucket: StorageBucket,
  path: string
): Promise<DeleteResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("[storage] delete error:", error);
      return { success: false, error: "이미지 삭제에 실패했습니다" };
    }

    return { success: true };
  } catch (err) {
    console.error("[storage] delete exception:", err);
    return { success: false, error: "이미지 삭제에 실패했습니다" };
  }
}

/**
 * 저장된 path 로부터 public URL 생성 (네트워크 호출 없음)
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * 전체 public URL 에서 bucket 내부 path 만 추출
 *
 * 예: https://xxx.supabase.co/storage/v1/object/public/attorneys/abc-def.jpg
 *  → 'abc-def.jpg'
 *
 * 삭제 시 URL 만 보관하는 경우 유용
 */
export function extractPathFromUrl(
  url: string,
  bucket: StorageBucket
): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}
