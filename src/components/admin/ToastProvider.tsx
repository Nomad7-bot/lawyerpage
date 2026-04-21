"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * 자체 토스트 시스템
 *
 * - 외부 의존성 없음 (react-hot-toast, sonner 등 미사용)
 * - success/error 2종류만 지원 — 프로젝트 토큰(text-success/text-error) 재사용
 * - 우하단 fixed, 3초 후 자동 닫힘, Modal 위(z-60)
 */

type ToastKind = "success" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_CLOSE_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_CLOSE_MS);
  }, []);

  const value: ToastContextValue = {
    success: (msg) => push("success", msg),
    error: (msg) => push("error", msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex min-w-[260px] max-w-[400px] items-center gap-3 rounded-card border border-bg-light bg-bg-white px-4 py-3 shadow-xl",
              "animate-[fade-in-up_160ms_ease-out]"
            )}
            role={t.kind === "error" ? "alert" : "status"}
          >
            {t.kind === "success" ? (
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-success"
                aria-hidden
              />
            ) : (
              <AlertCircle
                className="h-5 w-5 shrink-0 text-error"
                aria-hidden
              />
            )}
            <p
              className={cn(
                "text-caption font-medium",
                t.kind === "success" ? "text-success" : "text-error"
              )}
            >
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast 는 <ToastProvider> 내부에서만 사용 가능합니다");
  }
  return ctx;
}
