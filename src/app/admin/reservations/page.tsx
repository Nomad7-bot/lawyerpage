import { ReservationCalendarShell } from "@/components/admin/reservations/ReservationCalendarShell";
import { ReservationFilters } from "@/components/admin/reservations/ReservationFilters";
import { ReservationListShell } from "@/components/admin/reservations/ReservationListShell";
import { ViewToggle } from "@/components/admin/reservations/ViewToggle";

import {
  currentSeoulMonth,
  getAttorneyOptions,
  getMonthReservations,
  getReservations,
  type ReservationFilter,
} from "@/lib/admin/reservations";

import type { ReservationStatus } from "@/types";

export const dynamic = "force-dynamic";

type SearchParamsPromise = Promise<Record<string, string | undefined>>;

const VALID_STATUS: ReadonlyArray<ReservationStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "REJECTED",
  "COMPLETED",
];

function parseFilter(
  sp: Record<string, string | undefined>
): ReservationFilter {
  const status = VALID_STATUS.includes(sp.status as ReservationStatus | "ALL")
    ? (sp.status as ReservationStatus | "ALL")
    : "ALL";
  const pageNum = Number(sp.page ?? "1");
  return {
    status,
    attorneyId: sp.attorneyId ?? "ALL",
    dateFrom: sp.dateFrom,
    dateTo: sp.dateTo,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
    sortBy: sp.sortBy === "preferred_date" ? "preferred_date" : "created_at",
    sortOrder: sp.sortOrder === "asc" ? "asc" : "desc",
  };
}

function getSeoulToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const sp = await searchParams;
  const view: "list" | "calendar" = sp.view === "calendar" ? "calendar" : "list";
  const filter = parseFilter(sp);
  const month = sp.month ?? currentSeoulMonth();

  const attorneyOptionsPromise = getAttorneyOptions();

  if (view === "calendar") {
    const [attorneys, rows] = await Promise.all([
      attorneyOptionsPromise,
      getMonthReservations(month, {
        status: filter.status,
        attorneyId: filter.attorneyId,
      }),
    ]);

    return (
      <section className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h1 font-bold text-primary">예약 관리</h1>
          <ViewToggle current="calendar" />
        </header>
        <ReservationFilters
          initial={filter}
          attorneys={attorneys}
          view="calendar"
        />
        <ReservationCalendarShell
          rows={rows}
          month={month}
          today={getSeoulToday()}
        />
      </section>
    );
  }

  const [attorneys, list] = await Promise.all([
    attorneyOptionsPromise,
    getReservations(filter),
  ]);

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1 font-bold text-primary">예약 관리</h1>
        <ViewToggle current="list" />
      </header>
      <ReservationFilters
        initial={filter}
        attorneys={attorneys}
        view="list"
      />
      <ReservationListShell
        rows={list.rows}
        total={list.total}
        page={list.page}
        pageSize={list.pageSize}
        sortBy={filter.sortBy ?? "created_at"}
        sortOrder={filter.sortOrder ?? "desc"}
      />
    </section>
  );
}
