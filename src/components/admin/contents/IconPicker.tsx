"use client";

import * as LucideIcons from "lucide-react";
import { Square } from "lucide-react";
import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  label?: string;
};

/**
 * lucide-react 아이콘 이름 입력 + 실시간 미리보기.
 *
 * - 사용자가 `Scale` 같이 PascalCase 이름을 입력하면 해당 아이콘을 렌더
 * - 존재하지 않는 이름이면 `Square` 로 fallback + 경고
 */
export function IconPicker({
  value,
  onChange,
  label = "아이콘 (lucide-react 이름)",
}: Props) {
  const { Icon, valid } = useMemo(() => {
    if (!value.trim()) return { Icon: Square, valid: true };
    const name = value.trim();
    const registry = LucideIcons as unknown as Record<string, LucideIcon>;
    const found = registry[name];
    if (found) return { Icon: found, valid: true };
    return { Icon: Square, valid: false };
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="icon-name"
        className="text-caption font-medium text-text-main"
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card border border-bg-light bg-bg-white">
          <Icon className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <input
          id="icon-name"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예: Scale, Gavel, Shield"
          className="h-12 flex-1 rounded-none border border-bg-light bg-bg-white px-3 font-mono text-caption text-text-main focus:border-accent focus:outline-none focus:ring-0"
        />
      </div>
      {!valid && value.trim().length > 0 && (
        <p className="text-caption text-warning">
          일치하는 아이콘을 찾지 못했습니다. lucide.dev/icons 에서 PascalCase
          이름을 확인해주세요.
        </p>
      )}
      <p className="text-caption text-text-sub">
        lucide-react 의 아이콘 이름(PascalCase)을 입력하세요.
      </p>
    </div>
  );
}
