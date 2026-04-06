"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SelectOption = { label: string; value: string };

type SelectProps = {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

export function Select({
  label,
  options,
  placeholder,
  error,
  helperText,
  value,
  onChange,
  id,
  disabled,
  className,
}: SelectProps) {
  const selectId = id ?? label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-caption font-medium text-text-main"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "h-12 w-full appearance-none px-4 py-3 pr-10 text-body rounded-none",
            "border bg-bg-white text-text-main",
            "transition-colors",
            "focus:outline-none focus:ring-0",
            !value && "text-text-sub",
            error
              ? "border-error focus:border-error"
              : "border-bg-light focus:border-accent",
            disabled &&
              "bg-bg-light text-text-sub cursor-not-allowed",
            className
          )}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-sub"
          aria-hidden
        />
      </div>
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
