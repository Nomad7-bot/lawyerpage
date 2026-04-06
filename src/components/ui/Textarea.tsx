import { cn } from "@/lib/utils/cn";

type TextareaProps = {
  label?: string;
  helperText?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({
  label,
  helperText,
  error,
  id,
  rows = 4,
  maxLength,
  value,
  className,
  disabled,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.replace(/\s+/g, "-").toLowerCase();
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-caption font-medium text-text-main"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 text-body rounded-none resize-y",
          "border bg-bg-white text-text-main",
          "placeholder:text-text-sub",
          "transition-colors",
          "focus:outline-none focus:ring-0",
          error
            ? "border-error focus:border-error"
            : "border-bg-light focus:border-accent",
          disabled &&
            "bg-bg-light text-text-sub cursor-not-allowed resize-none",
          className
        )}
        {...props}
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          {error && (
            <p className="text-caption text-error" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-caption text-text-sub">{helperText}</p>
          )}
        </div>
        {maxLength && (
          <p className="shrink-0 text-caption text-text-sub">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
