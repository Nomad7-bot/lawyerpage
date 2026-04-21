import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import type { BreadcrumbSchemaItem } from "@/lib/schema";
import { cn } from "@/lib/utils/cn";

type PageHeaderSize = "sm" | "md";

type PageHeaderProps = {
  breadcrumbItems: BreadcrumbSchemaItem[];
  title: string;
  subtitle?: string;
  /** sm: min-h-200 py-10 (예약 플로우). md: min-h-320 py-12 (일반 리스트, 기본값) */
  size?: PageHeaderSize;
};

const sizeStyles: Record<PageHeaderSize, { section: string; wrapper: string; gap: string }> = {
  sm: { section: "min-h-[200px]", wrapper: "py-10", gap: "mt-4" },
  md: { section: "min-h-[320px]", wrapper: "py-12", gap: "mt-6" },
};

/**
 * 공개 페이지 공통 헤더 배너 (PRD §5 상단 히어로).
 * Breadcrumb(UI) + BreadcrumbJsonLd(SEO) + 타이틀/서브타이틀을 한 번에 처리해
 * 각 페이지의 동일 패턴 반복을 제거한다.
 */
export function PageHeader({
  breadcrumbItems,
  title,
  subtitle,
  size = "md",
}: PageHeaderProps) {
  const styles = sizeStyles[size];
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <section
        className={cn(
          "bg-primary flex flex-col justify-center",
          styles.section
        )}
      >
        <div className={cn("container-content", styles.wrapper)}>
          <Breadcrumb items={breadcrumbItems} variant="dark" />
          <h1 className={cn(styles.gap, "text-h1 font-bold text-bg-white")}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(size === "sm" ? "mt-2" : "mt-3", "text-body text-bg-white/70")}>
              {subtitle}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
