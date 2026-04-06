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
  ...props
}: InputProps) {
  const inputId = id ?? label?.replace(/\s+/g, "-").toLowerCase();

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
        className={cn(
          "h-12 w-full px-4 py-3 text-body rounded-none",
          "border bg-bg-white text-text-main",
          "placeholder:text-text-sub",
          "transition-colors",
          "focus:outline-none focus:ring-0",
          error
            ? "border-error focus:border-error"
            : "border-bg-light focus:border-accent",
          disabled &&
            "bg-bg-light text-text-sub cursor-not-allowed",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-caption text-text-sub">{helperText}</p>
      )}
    </div>
  );
}
