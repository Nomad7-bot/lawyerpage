import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rejected"
  | "category"
  | "tag";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-[rgba(245,124,0,0.1)] text-warning",
  confirmed: "bg-[rgba(46,125,50,0.1)] text-success",
  cancelled: "bg-bg-light text-text-sub",
  rejected: "bg-[rgba(211,47,47,0.1)] text-error",
  category: "bg-primary text-bg-white",
  tag: "border border-primary text-primary bg-transparent",
};

export function Badge({
  variant = "category",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-caption font-medium rounded-none",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
