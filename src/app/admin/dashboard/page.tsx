import { CalendarDays, Clock, FileText, TrendingUp } from "lucide-react";

import { DashboardGreeting } from "@/components/admin/DashboardGreeting";
import { RecentPostsList } from "@/components/admin/dashboard/RecentPostsList";
import { RecentReservationsTable } from "@/components/admin/dashboard/RecentReservationsTable";
import { SummaryCard } from "@/components/admin/dashboard/SummaryCard";

import {
  getDashboardStats,
  getRecentPosts,
  getRecentReservations,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, reservations, posts] = await Promise.all([
    getDashboardStats(),
    getRecentReservations(5),
    getRecentPosts(5),
  ]);

  const todayHelper = `${stats.today.confirmed}건 확정, ${stats.today.pending}건 대기`;

  return (
    <section className="space-y-12">
      <header>
        <h1 className="text-h1 font-bold text-primary">관리자 대시보드</h1>
        <DashboardGreeting />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="오늘의 예약"
          labelEn="Today's Reservations"
          value={stats.today.total}
          helper={todayHelper}
          accent="gold"
          icon={TrendingUp}
        />
        <SummaryCard
          label="대기 중 예약"
          labelEn="Pending"
          value={stats.pending}
          helper="대기 중인 항목"
          accent="warning"
          icon={Clock}
        />
        <SummaryCard
          label="이번 달 예약"
          labelEn="Monthly Total"
          value={stats.monthlyTotal}
          helper="이번 달 상담 예정"
          accent="plain"
          icon={CalendarDays}
        />
        <SummaryCard
          label="게시글"
          labelEn="Total Posts"
          value={stats.totalPosts}
          helper="전체 법률 콘텐츠 현황"
          accent="plain"
          icon={FileText}
        />
      </div>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="w-full lg:w-2/3">
          <RecentReservationsTable data={reservations} />
        </div>
        <div className="w-full lg:w-1/3">
          <RecentPostsList data={posts} />
        </div>
      </div>
    </section>
  );
}
