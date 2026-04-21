import { cn } from "@/lib/utils/cn";

type InputProps = {
  label?: string;
  helperText?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({
  label,
  helperText,
  error,
  id,
  className,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, "-").toLowerCase();
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  const helperId = !error && helperText && inputId ? `${inputId}-helper` : undefined;
  const describedBy =
    [ariaDescribedBy, errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-caption font-medium text-text-main"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full px-4 py-3 text-body rounded-none",
          "border bg-bg-white text-text-main",
          "placeholder:text-text-sub",
          "transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
          error
            ? "border-error focus:border-error focus-visible:ring-error"
            : "border-bg-light focus:border-accent focus-visible:ring-accent",
          disabled &&
            "bg-bg-light text-text-sub cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-caption text-text-sub">
          {helperText}
        </p>
      )}
    </div>
  );
}
