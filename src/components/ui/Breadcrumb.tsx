import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: ">" | "/";
  /** "dark": 기본 (어두운 배경에서 흰색 텍스트) | "light": 밝은 배경 기본 스타일 */
  variant?: "dark" | "light";
  className?: string;
};

export function Breadcrumb({
  items,
  separator = ">",
  variant = "light",
  className,
}: BreadcrumbProps) {
  const isDark = variant === "dark";

  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol
        className={cn(
          "flex items-center flex-wrap gap-1 text-caption",
          isDark ? "text-bg-white/60" : "text-text-sub"
        )}
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <span
                  className={cn(
                    "select-none",
                    isDark ? "text-bg-white/40" : "text-text-sub/60"
                  )}
                  aria-hidden
                >
                  {separator}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    isLast && (isDark ? "text-bg-white" : "text-text-main")
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    isDark
                      ? "text-bg-white/60 hover:text-bg-white"
                      : "hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
