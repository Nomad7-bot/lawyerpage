"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
  disabled?: boolean;
};

export function TagInput({
  tags,
  onChange,
  placeholder = "태그 입력 후 Enter",
  label = "태그",
  maxTags = 20,
  disabled = false,
}: Props) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setDraft("");
      return;
    }
    if (tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draft.trim()) {
        e.preventDefault();
        addTag(draft);
      }
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-caption font-medium text-text-main">{label}</label>
      <div
        className={cn(
          "flex min-h-12 flex-wrap items-center gap-1.5 rounded-none border border-bg-light bg-bg-white px-3 py-2",
          "focus-within:border-accent",
          disabled && "cursor-not-allowed bg-bg-light"
        )}
      >
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-caption text-accent"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              aria-label={`${t} 태그 제거`}
              disabled={disabled}
              className="text-accent hover:text-error"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled || tags.length >= maxTags}
          className="min-w-[120px] flex-1 bg-transparent text-body text-text-main placeholder:text-text-sub focus:outline-none"
        />
      </div>
      {tags.length >= maxTags && (
        <p className="text-caption text-warning">
          최대 {maxTags}개까지 추가할 수 있습니다
        </p>
      )}
    </div>
  );
}
