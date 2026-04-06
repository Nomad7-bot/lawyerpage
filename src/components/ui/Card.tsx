import { cn } from "@/lib/utils/cn";

type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = {
  hover?: boolean;
  padding?: CardPadding;
} & React.HTMLAttributes<HTMLDivElement>;

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-white rounded-card",
        hover && "transition-shadow duration-200 hover:shadow-lg",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
