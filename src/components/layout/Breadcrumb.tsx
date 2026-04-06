import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * 모든 서브 페이지에 표시되는 브레드크럼 (PRD §8.6)
 * 마지막 아이템은 현재 페이지 (href 없음)
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="container-content py-4">
      <ol className="flex items-center flex-wrap gap-1 text-caption text-text-sub">
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            홈
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-text-sub/60" aria-hidden />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-main" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
