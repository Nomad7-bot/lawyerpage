import { cn } from "@/lib/utils/cn";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionTitle({
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <h2 className="text-h2 font-bold text-primary">{title}</h2>
      <div
        className={cn(
          "mt-4 h-0.5 w-12 bg-accent",
          align === "center" && "mx-auto"
        )}
        aria-hidden
      />
      {subtitle && (
        <p className="mt-3 text-body text-text-sub">{subtitle}</p>
      )}
    </div>
  );
}
