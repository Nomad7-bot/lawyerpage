"use client";

import { useAuth } from "@/hooks/useAuth";

/**
 * 대시보드 상단에 로그인한 관리자 이메일을 표시하는 컴포넌트
 *
 * - useAuth 훅의 동작 검증 + 사용자 피드백 겸용
 * - 로딩 중: skeleton 느낌의 플레이스홀더
 * - 미인증: 미들웨어가 이미 리다이렉트하므로 이 페이지에서는 이론상 노출 안 됨
 */
export function DashboardGreeting() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <p className="mt-4 text-body text-text-sub">
        관리자 정보를 불러오는 중...
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <p className="mt-4 text-body text-text-sub">
      <span className="font-medium text-text-main">{user.email}</span> 님,
      환영합니다.
    </p>
  );
}
