import { Badge } from "@/components/ui/Badge";
import { DashboardSectionHeader } from "@/components/admin/dashboard/DashboardSectionHeader";

import type { RecentReservation } from "@/lib/dashboard";
import type { ReservationStatus } from "@/types";

type RecentReservationsTableProps = {
  data: RecentReservation[];
};

type StatusMeta = {
  variant: "pending" | "confirmed" | "cancelled" | "rejected";
  label: string;
};

const statusMeta: Record<ReservationStatus, StatusMeta> = {
  PENDING: { variant: "pending", label: "대기" },
  CONFIRMED: { variant: "confirmed", label: "확정" },
  CANCELLED: { variant: "cancelled", label: "취소" },
  REJECTED: { variant: "rejected", label: "거절" },
  COMPLETED: { variant: "confirmed", label: "완료" },
};

function formatDate(date: string): string {
  // YYYY-MM-DD → MM.DD
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
}

function formatTime(time: string): string {
  // HH:MM:SS → HH:MM
  return time.slice(0, 5);
}

export function RecentReservationsTable({
  data,
}: RecentReservationsTableProps) {
  return (
    <section>
      <DashboardSectionHeader
        title="최근 예약"
        subtitle="실시간 예약 현황 및 관리"
        href="/admin/reservations"
      />

      <div className="overflow-hidden rounded-card bg-bg-white">
        {data.length === 0 ? (
          <p className="py-12 text-center text-body text-text-sub">
            등록된 예약이 없습니다
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-light">
                  <th className="px-6 py-4 text-caption font-bold uppercase tracking-widest text-primary">
                    No.
                  </th>
                  <th className="px-6 py-4 text-caption font-bold uppercase tracking-widest text-primary">
                    신청자
                  </th>
                  <th className="px-6 py-4 text-caption font-bold uppercase tracking-widest text-primary">
                    변호사
                  </th>
                  <th className="px-6 py-4 text-caption font-bold uppercase tracking-widest text-primary">
                    일시
                  </th>
                  <th className="px-6 py-4 text-caption font-bold uppercase tracking-widest text-primary">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-light">
                {data.map((row) => {
                  const meta = statusMeta[row.status];
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-accent/5"
                    >
                      <td className="px-6 py-5 text-caption font-semibold text-primary">
                        {row.reservation_no}
                      </td>
                      <td className="px-6 py-5 text-caption text-text-main">
                        {row.client_name} 님
                      </td>
                      <td className="px-6 py-5 text-caption text-text-main">
                        {row.attorney_name
                          ? `${row.attorney_name} 변호사`
                          : "변호사 무관"}
                      </td>
                      <td className="px-6 py-5 text-caption text-text-main">
                        {formatDate(row.preferred_date)}{" "}
                        {formatTime(row.preferred_time)}
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
