"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Copy } from "lucide-react";

import { useToast } from "@/components/admin/ToastProvider";
import { cn } from "@/lib/utils/cn";

import type { SchemaStatus } from "@/lib/admin/structured-data";

export function StructuredDataCard({ status }: { status: SchemaStatus }) {
  const toast = useToast();
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(status.snippet);
      toast.success(`${status.name} 스니펫을 복사했습니다`);
    } catch {
      toast.error("클립보드 복사에 실패했습니다");
    }
  };

  return (
    <article className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-bg-light px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-body font-bold text-primary">{status.name}</h3>
          <p className="mt-0.5 text-caption text-text-sub">{status.note}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold",
            status.applied
              ? "bg-success/10 text-success"
              : "bg-warning/10 text-warning"
          )}
        >
          {status.applied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              적용됨
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              확인 필요
            </>
          )}
        </span>
      </header>

      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-2 text-caption font-bold text-text-sub transition-colors hover:bg-accent/5"
          aria-expanded={expanded}
        >
          <span>JSON-LD 스니펫</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>

        {expanded && (
          <div className="relative">
            <pre className="max-h-72 overflow-auto bg-primary px-4 py-3 font-mono text-caption leading-relaxed text-bg-white/90">
              {status.snippet}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="스니펫 복사"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-none bg-bg-white/10 text-bg-white/80 transition-colors hover:bg-bg-white/20"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
