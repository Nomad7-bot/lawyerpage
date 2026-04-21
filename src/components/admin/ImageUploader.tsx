"use client";

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import {
  BUCKET_DEFAULTS,
  deleteImage,
  extractPathFromUrl,
  uploadImage,
  type StorageBucket,
} from "@/lib/storage";

type ImageUploaderProps = {
  bucket: StorageBucket;
  pathPrefix?: string;
  /** 바이트 단위. 생략 시 버킷별 기본값 사용 */
  maxSize?: number;
  /** 쉼표로 구분된 MIME 리스트. 생략 시 버킷별 기본값 사용 */
  accept?: string;
  currentImage?: string | null;
  /** 업로드 성공 또는 삭제 성공 시 호출. 삭제일 땐 null */
  onUpload: (url: string | null) => void;
  label?: string;
  /** 권장 크기/비율 안내 (예: "권장 400x500 (1:1.25)") */
  aspectHint?: string;
  disabled?: boolean;
  /** 미리보기를 원형으로 렌더 (프로필 사진용) */
  circular?: boolean;
};

/**
 * 관리자용 이미지 업로더
 *
 * - drag & drop + 파일 선택 버튼
 * - 미리보기(객체 URL) + 진행 중 스피너 + 에러 메시지
 * - 기존 이미지(currentImage) 위에 새 파일 드롭 시 자동 교체되지는 않음
 *   (호출 측이 onUpload 콜백에서 DB 업데이트 + 기존 파일 삭제 처리)
 * - 단일 파일만 허용
 */
export function ImageUploader({
  bucket,
  pathPrefix,
  maxSize,
  accept,
  currentImage,
  onUpload,
  label,
  aspectHint,
  disabled = false,
  circular = false,
}: ImageUploaderProps) {
  const defaults = BUCKET_DEFAULTS[bucket];
  const effectiveMaxSize = maxSize ?? defaults.maxSize;
  const effectiveAccept = accept ?? defaults.accept.join(",");
  const acceptList = effectiveAccept.split(",").map((s) => s.trim());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  // blob URL cleanup
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // currentImage prop 동기화 (부모에서 리셋 시 반영)
  useEffect(() => {
    setPreview(currentImage ?? null);
    setUploadedPath(null);
  }, [currentImage]);

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const humanMaxSize = (): string => {
    const mb = effectiveMaxSize / (1024 * 1024);
    return mb >= 1 ? `${Math.round(mb)}MB` : `${Math.round(effectiveMaxSize / 1024)}KB`;
  };

  const validate = (file: File): string | null => {
    if (file.size > effectiveMaxSize) {
      return `파일 크기가 ${humanMaxSize()}를 초과합니다`;
    }
    if (!acceptList.includes(file.type)) {
      const formats = acceptList
        .map((mime) => mime.replace("image/", "").toUpperCase())
        .join(", ");
      return `${formats} 형식만 업로드 가능합니다`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);

    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 미리보기 (blob URL)
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    setProgress(10);

    // Supabase SDK 는 progress event 미지원 → 시뮬레이션
    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 5 : prev));
    }, 200);

    try {
      const result = await uploadImage(bucket, file, pathPrefix);
      clearInterval(progressTimer);

      if (!result.success) {
        setError(result.error);
        setProgress(0);
        // 미리보기는 유지 (재시도 가능하도록)
        return;
      }

      setProgress(100);
      setUploadedPath(result.path);
      onUpload(result.publicUrl);
    } catch (err) {
      clearInterval(progressTimer);
      console.error("[ImageUploader] unexpected:", err);
      setError("업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // 같은 파일 재선택 허용
    e.target.value = "";
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  };

  const handleDelete = async () => {
    setError(null);

    // 현재 세션에서 방금 업로드한 파일
    if (uploadedPath) {
      const result = await deleteImage(bucket, uploadedPath);
      if (!result.success) {
        setError(result.error);
        return;
      }
    } else if (currentImage) {
      // prop 으로 받은 기존 이미지 URL → path 추출 후 삭제
      const path = extractPathFromUrl(currentImage, bucket);
      if (path) {
        const result = await deleteImage(bucket, path);
        if (!result.success) {
          setError(result.error);
          return;
        }
      }
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setUploadedPath(null);
    setProgress(0);
    onUpload(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {(label || aspectHint) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <span className="text-caption font-medium text-text-main">{label}</span>
          )}
          {aspectHint && (
            <span className="text-caption text-text-sub">{aspectHint}</span>
          )}
        </div>
      )}

      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={preview ? "이미지 변경" : "이미지 업로드"}
        aria-disabled={disabled || uploading}
        onClick={openFileDialog}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-64 w-full flex-col items-center justify-center gap-3",
          "cursor-pointer rounded-card border-2 border-dashed p-6",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-bg-light bg-bg-white hover:border-primary-light",
          (disabled || uploading) && "cursor-not-allowed opacity-60"
        )}
      >
        {preview ? (
          <>
            {/* 미리보기 이미지 — circular 면 원형 1:1, 기본은 직사각 */}
            <div
              className={cn(
                "relative overflow-hidden",
                circular
                  ? "h-40 w-40 rounded-full"
                  : "h-56 w-full rounded-card"
              )}
            >
              {/* next/image 는 blob: URL 을 지원하지 않으므로 <img> 사용 */}
              {preview.startsWith("blob:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="업로드 미리보기"
                  className={cn(
                    "h-full w-full",
                    circular ? "object-cover" : "object-contain"
                  )}
                />
              ) : (
                <Image
                  src={preview}
                  alt="업로드 미리보기"
                  fill
                  sizes={circular ? "160px" : "(max-width: 768px) 100vw, 400px"}
                  className={circular ? "object-cover" : "object-contain"}
                />
              )}
            </div>
            {!uploading && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDelete();
                }}
                aria-label="이미지 삭제"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-card bg-bg-white text-error shadow-sm transition-colors hover:bg-error hover:text-bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-light text-text-sub">
              {isDragging ? (
                <Upload className="h-7 w-7" aria-hidden />
              ) : (
                <ImageIcon className="h-7 w-7" aria-hidden />
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-body text-text-main">
                {isDragging
                  ? "여기에 파일을 놓아주세요"
                  : "이미지를 드래그하거나 클릭해서 업로드"}
              </p>
              <p className="text-caption text-text-sub">
                {acceptList
                  .map((m) => m.replace("image/", "").toUpperCase())
                  .join(", ")}{" "}
                · 최대 {humanMaxSize()}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || uploading}
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              파일 선택
            </Button>
          </>
        )}

        {/* 업로드 오버레이 */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-card bg-bg-white/85 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
            <span className="text-caption text-text-sub">업로드 중...</span>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-bg-light">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={effectiveAccept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* 에러 메시지 */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-card border border-error/20 bg-error/5 p-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-error"
            aria-hidden
          />
          <p className="text-caption text-error">{error}</p>
        </div>
      )}
    </div>
  );
}
