import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type BreadcrumbItem = { label: string; href?: string };

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: ">" | "/";
  className?: string;
};

export function Breadcrumb({
  items,
  separator = ">",
  className,
}: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1 text-caption text-text-sub">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1">
              {idx > 0 && (
                <span className="text-text-sub/60 select-none" aria-hidden>
                  {separator}
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(isLast && "text-text-main")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
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
