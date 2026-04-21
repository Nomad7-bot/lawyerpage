"use client";

import { useEffect, useRef } from "react";

import { slugify } from "@/lib/slugify";

type Props = {
  /** 현재 slug 값 */
  value: string;
  onChange: (next: string) => void;
  /** 제목 등 자동 생성에 쓸 원본 */
  source: string;
  /** 최초 mount 시 이미 수동 편집된 상태면 자동 생성 중지 */
  manuallyEditedInitial?: boolean;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

/**
 * 제목 → 자동 slug 생성, 사용자가 수동 편집한 이후에는 자동 동기화 중단.
 */
export function SlugInput({
  value,
  onChange,
  source,
  manuallyEditedInitial = false,
  label = "슬러그",
  placeholder = "url-slug",
  disabled = false,
}: Props) {
  const manual = useRef(manuallyEditedInitial);

  // source 변경 시 (수동 편집 전) 자동 생성
  useEffect(() => {
    if (manual.current) return;
    const auto = slugify(source);
    if (auto !== value) {
      onChange(auto);
    }
    // 의도적으로 onChange/value 는 deps 제외 — 제목 변경 시에만 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="slug-input"
        className="text-caption font-medium text-text-main"
      >
        {label}
      </label>
      <input
        id="slug-input"
        type="text"
        value={value}
        onChange={(e) => {
          manual.current = true;
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 w-full rounded-none border border-bg-light bg-bg-white px-4 py-3 font-mono text-caption text-text-main placeholder:text-text-sub focus:border-accent focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-bg-light"
      />
      <p className="text-caption text-text-sub">
        URL 경로로 사용됩니다. 비우면 제목에서 자동 생성됩니다.
      </p>
    </div>
  );
}
