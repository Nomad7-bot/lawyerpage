import { DashboardGreeting } from "@/components/admin/DashboardGreeting";

export default function AdminDashboardPage() {
  return (
    <section>
      <h1 className="text-h1 font-bold text-primary">관리자 대시보드</h1>
      <DashboardGreeting />
      <p className="mt-2 text-body text-text-sub">
        요약 현황 및 통계 페이지입니다. 준비 중입니다.
      </p>
    </section>
  );
}
