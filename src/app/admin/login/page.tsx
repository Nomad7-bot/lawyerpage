"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  HelpCircle,
  LogIn,
  Scale,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

/**
 * 관리자 로그인 페이지
 *
 * - Split 레이아웃: 좌측 navy 브랜딩 / 우측 폼 (lg 이상에서만 좌측 노출)
 * - `fixed inset-0 z-50` 로 부모 admin layout(헤더/컨테이너) 위를 덮어
 *   로그인 화면이 전체 뷰포트를 점유
 * - 로그인 성공 → /admin/dashboard, router.refresh() 로 middleware 재평가
 *
 * ⚠️ "로그인 상태 유지" 체크박스는 현재 UI-only.
 *    Supabase SDK 는 기본적으로 세션을 쿠키에 persist 하므로 UX 상징용.
 *    향후 Remember Me 정책 (세션 maxAge 조정) 확장 포인트.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mapError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "이메일 또는 비밀번호가 올바르지 않습니다";
    }
    if (lower.includes("email not confirmed")) {
      return "이메일 인증이 필요합니다. 관리자에게 문의해주세요";
    }
    if (lower.includes("network") || lower.includes("fetch")) {
      return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요";
    }
    return "로그인 중 오류가 발생했습니다";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(mapError(signInError.message));
        setLoading(false);
        return;
      }

      // 성공 → 미들웨어가 새 세션 쿠키를 읽고 통과시킬 수 있도록 refresh
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(mapError(message));
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert(
      "비밀번호 재설정은 관리자에게 문의해주세요.\n(향후 이메일 인증 기반 재설정 기능 예정)"
    );
  };

  return (
    <main className="fixed inset-0 z-50 flex h-screen w-full bg-bg-white">
      {/* 왼쪽 브랜딩 패널 (lg 이상에서만 표시) */}
      <section
        className="relative hidden flex-col items-center justify-center overflow-hidden bg-primary px-18 lg:flex lg:w-1/2"
        aria-hidden="true"
      >
        {/* 기하학 장식 (accent 원 + 십자) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
          <svg
            width="600"
            height="600"
            viewBox="0 0 100 100"
            className="stroke-accent"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              strokeWidth="0.2"
            />
            <line x1="10" y1="50" x2="90" y2="50" strokeWidth="0.1" />
            <line x1="50" y1="10" x2="50" y2="90" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <Scale className="mb-8 h-16 w-16 text-accent" aria-hidden />
          <h1 className="text-h2 font-bold uppercase tracking-[0.2em] text-accent">
            법률사무소
          </h1>
          <p className="mt-4 text-body tracking-widest text-bg-white/70">
            관리자 시스템
          </p>
          <div className="mt-12 h-px w-24 bg-accent/30" />
        </div>

        <p className="absolute bottom-8 text-caption uppercase tracking-[0.3em] text-bg-white/40">
          Supreme Legal Management Protocol
        </p>
      </section>

      {/* 오른쪽 폼 */}
      <section className="flex w-full items-center justify-center px-8 sm:px-12 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <header className="mb-12">
            <h2 className="mb-2 text-h3 font-bold text-primary">관리자 로그인</h2>
            <p className="text-caption text-text-sub">
              관리자 계정으로 로그인해 주세요
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="이메일"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lawfirm.co.kr"
              disabled={loading}
            />

            {/* 비밀번호: visibility 토글 포함 — Input 컴포넌트 래핑 */}
            <div className="relative">
              <Input
                label="비밀번호"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[34px] flex h-12 items-center text-text-sub transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>

            {/* 공통 에러 메시지 */}
            {error && (
              <p
                role="alert"
                className="flex items-center gap-2 text-caption text-error"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            {/* 옵션 row: 로그인 유지 + 비밀번호 찾기 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer border-bg-light text-primary focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-caption text-text-main">
                  로그인 상태 유지
                </span>
              </label>
              <a
                href="#"
                onClick={handleForgotPassword}
                className="text-caption text-accent underline-offset-4 hover:underline"
              >
                비밀번호 찾기
              </a>
            </div>

            {/* 로그인 버튼 */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={loading}
              >
                <LogIn className="mr-2 h-4 w-4" aria-hidden />
                로그인
              </Button>
            </div>
          </form>

          {/* 푸터 */}
          <footer className="mt-12 border-t border-bg-light pt-6">
            <div className="flex items-center justify-between text-caption text-text-sub">
              <p>© 2026 법률사무소</p>
              <a
                href="mailto:admin@lawfirm.co.kr"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <HelpCircle className="h-4 w-4" aria-hidden />
                기술 지원
              </a>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
