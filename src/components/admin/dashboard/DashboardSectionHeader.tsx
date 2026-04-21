import Link from "next/link";
import { ArrowRight } from "lucide-react";

type DashboardSectionHeaderProps = {
  title: string;
  subtitle?: string;
  href: string;
  linkLabel?: string;
};

export function DashboardSectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "전체보기",
}: DashboardSectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h3 className="text-h3 font-bold text-primary">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-caption text-text-sub">{subtitle}</p>
        ) : null}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 border-b border-accent/30 pb-1 text-caption font-bold uppercase tracking-widest text-accent transition-colors hover:border-accent hover:text-accent-light"
      >
        {linkLabel}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
