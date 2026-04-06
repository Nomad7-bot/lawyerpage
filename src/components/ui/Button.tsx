import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "cta"
  | "danger";
export type ButtonSize = "lg" | "md" | "sm";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-bg-white hover:bg-primary-light",
  secondary:
    "border border-primary text-primary bg-transparent hover:bg-primary hover:text-bg-white",
  ghost: "text-primary bg-transparent hover:bg-bg-light",
  cta: "bg-accent text-bg-white hover:bg-accent-light hover:text-text-main",
  danger: "bg-error text-bg-white hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "h-14 px-8 text-body",
  md: "h-12 px-6 text-body",
  sm: "h-9 px-4 text-caption",
};

const baseStyles =
  "inline-flex items-center justify-center font-medium rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

/**
 * Button 스타일을 반환하는 헬퍼.
 * `<Link>`나 `<a>` 요소를 버튼처럼 스타일링할 때 사용
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        children
      )}
    </button>
  );
}
