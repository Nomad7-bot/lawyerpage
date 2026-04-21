import { redirect } from "next/navigation";

/**
 * /admin 루트 접근 시 로그인 페이지로 리다이렉트.
 * 추후 Phase 3 middleware 에서 세션 확인 후 dashboard 로도 분기 가능.
 */
export default function AdminIndexPage() {
  redirect("/admin/login");
}
