import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { INSIGHT_CATEGORIES } from "@/constants/dummy";

type InsightFilterTabsProps = {
  activeCategory: string;
};

export function InsightFilterTabs({ activeCategory }: InsightFilterTabsProps) {
  return (
    <nav
      aria-label="법률정보 카테고리 필터"
      className="border-b border-bg-light overflow-x-auto"
    >
      <ul className="flex gap-0 min-w-max md:min-w-0">
        {INSIGHT_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const href =
            cat === "전체"
              ? "/insights"
              : `/insights?category=${encodeURIComponent(cat)}`;
          return (
            <li key={cat}>
              <Link
                href={href}
                className={cn(
                  "inline-flex items-center px-5 py-4 text-body font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "text-primary border-b-2 border-accent font-semibold"
                    : "text-text-sub hover:text-primary border-b-2 border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {cat}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
