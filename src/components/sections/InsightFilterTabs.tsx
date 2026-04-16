import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { PostCategory } from "@/types/database";

type InsightFilterTabsProps = {
  categories: Pick<PostCategory, "name" | "slug">[];
  /** 현재 활성 카테고리 slug. undefined/빈 문자열 = 전체 */
  activeSlug?: string;
};

export function InsightFilterTabs({
  categories,
  activeSlug,
}: InsightFilterTabsProps) {
  const isAllActive = !activeSlug;
  return (
    <nav
      aria-label="법률정보 카테고리 필터"
      className="border-b border-bg-light overflow-x-auto"
    >
      <ul className="flex gap-0 min-w-max md:min-w-0">
        <li>
          <Link
            href="/insights"
            className={cn(
              "inline-flex items-center px-5 py-4 text-body font-medium whitespace-nowrap transition-colors",
              isAllActive
                ? "text-primary border-b-2 border-accent font-semibold"
                : "text-text-sub hover:text-primary border-b-2 border-transparent"
            )}
            aria-current={isAllActive ? "page" : undefined}
          >
            전체
          </Link>
        </li>
        {categories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <li key={cat.slug}>
              <Link
                href={`/insights?category=${encodeURIComponent(cat.slug)}`}
                className={cn(
                  "inline-flex items-center px-5 py-4 text-body font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-primary border-b-2 border-accent font-semibold"
                    : "text-text-sub hover:text-primary border-b-2 border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
