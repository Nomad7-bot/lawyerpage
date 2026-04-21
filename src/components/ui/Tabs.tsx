"use client";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";

type TabItem = {
  key: string;
  label: string;
};

type TabsProps = {
  items: readonly TabItem[];
  current: string;
  /** URL 쿼리 파라미터 키 (기본: "tab") */
  paramKey?: string;
};

/**
 * URL 쿼리 기반 탭 네비게이션.
 *
 * - 클릭 시 `?{paramKey}={key}` 로 이동하며 다른 쿼리는 의도적으로 리셋
 *   (탭마다 표시 데이터와 필터 스펙이 다르므로 혼선 방지)
 * - 활성 탭: navy 텍스트 + gold 하단 border
 */
export function Tabs({ items, current, paramKey = "tab" }: TabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const go = (key: string) => {
    if (key === current) return;
    router.push(`${pathname}?${paramKey}=${key}`);
  };

  return (
    <div
      role="tablist"
      aria-label="콘텐츠 탭"
      className="flex items-center gap-6 border-b border-bg-light"
    >
      {items.map((item) => {
        const active = item.key === current;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => go(item.key)}
            className={cn(
              "relative -mb-px border-b-2 px-1 pb-3 pt-1 text-body font-bold transition-colors",
              active
                ? "border-accent text-primary"
                : "border-transparent text-text-sub hover:text-primary"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
