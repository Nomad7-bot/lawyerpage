"use client";

import Image from "next/image";
import { Globe } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  siteUrl: string;
  pageUrl: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
};

/**
 * Google 검색 결과 + SNS 공유 카드 미리보기.
 *
 * - 실시간 반영 (입력 값이 바뀌면 즉시 프리뷰 갱신)
 * - fallback: 각 값이 비어있으면 '제목/설명이 설정되지 않았습니다' 회색 표시
 */
export function SeoPreviews({
  siteUrl,
  pageUrl,
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImage,
}: Props) {
  const fullUrl = `${siteUrl.replace(/\/$/, "")}${pageUrl}`;
  const displayTitle = metaTitle || "(제목이 설정되지 않았습니다)";
  const displayDesc =
    metaDescription || "(설명이 설정되지 않았습니다. Meta Description 을 입력하세요.)";
  const displayOgTitle = ogTitle || metaTitle || "(OG 제목이 비어있습니다)";
  const displayOgDesc =
    ogDescription || metaDescription || "(OG 설명이 비어있습니다)";

  return (
    <div className="space-y-4">
      {/* Google 검색 결과 */}
      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Google 검색 결과 미리보기
        </h4>
        <div className="rounded-card border border-bg-light bg-bg-white p-4">
          <div className="flex items-center gap-2 text-caption text-text-sub">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-light">
              <Globe className="h-3 w-3" aria-hidden />
            </div>
            <span className="truncate">{fullUrl}</span>
          </div>
          <h3
            className={cn(
              "mt-1 line-clamp-1 text-body font-medium",
              metaTitle ? "text-[#1a0dab]" : "text-text-sub/60"
            )}
          >
            {displayTitle}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-caption",
              metaDescription ? "text-text-main" : "text-text-sub/60"
            )}
          >
            {displayDesc}
          </p>
        </div>
      </section>

      {/* SNS 공유 카드 */}
      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          SNS 공유 미리보기
        </h4>
        <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
          <div className="relative aspect-[1200/630] w-full bg-bg-light">
            {ogImage ? (
              <Image
                src={ogImage}
                alt="OG 이미지"
                fill
                sizes="440px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-caption text-text-sub">
                OG 이미지 미설정 (권장 1200×630)
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-wider text-text-sub">
              {new URL(siteUrl).host}
            </p>
            <h3
              className={cn(
                "mt-1 line-clamp-2 text-body font-bold",
                ogTitle || metaTitle ? "text-primary" : "text-text-sub/60"
              )}
            >
              {displayOgTitle}
            </h3>
            <p
              className={cn(
                "mt-1 line-clamp-2 text-caption",
                ogDescription || metaDescription
                  ? "text-text-main"
                  : "text-text-sub/60"
              )}
            >
              {displayOgDesc}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
