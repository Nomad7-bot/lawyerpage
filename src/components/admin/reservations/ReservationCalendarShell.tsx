"use client";

import { useMemo, useState } from "react";

import { DayReservationsPanel } from "@/components/admin/reservations/DayReservationsPanel";
import { ReservationCalendar } from "@/components/admin/reservations/ReservationCalendar";
import { ReservationDetailModal } from "@/components/admin/reservations/ReservationDetailModal";
import {
  StatusChangeDialog,
  type StatusChangeSummary,
  type StatusChangeTarget,
} from "@/components/admin/reservations/StatusChangeDialog";

import type { AdminReservationRow } from "@/lib/admin/reservations";

type CalendarShellProps = {
  rows: AdminReservationRow[];
  month: string;
  today: string;
};

type DialogState =
  | {
      ids: string[];
      summary: StatusChangeSummary | null;
      targetStatus: StatusChangeTarget;
    }
  | null;

/**
 * 캘린더 뷰 컨테이너.
 *
 * - 날짜 선택은 client state 만 (URL 에 `selectedDate` 담지 않음 — 월 이동 시 초기화)
 * - 날짜별 예약은 `rows` 를 in-memory 그룹핑해서 패널에 넘김
 */
export function ReservationCalendarShell({
  rows,
  month,
  today,
}: CalendarShellProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [detailRow, setDetailRow] = useState<AdminReservationRow | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

  const dayRows = useMemo(
    () =>
      selectedDate
        ? rows.filter((r) => r.preferred_date === selectedDate)
        : [],
    [rows, selectedDate]
  );

  const openDialogForRow = (
    row: AdminReservationRow,
    targetStatus: StatusChangeTarget
  ) => {
    setDialog({
      ids: [row.id],
      summary: {
        reservation_no: row.reservation_no,
        client_name: row.client_name,
        preferred_date: row.preferred_date,
        preferred_time: row.preferred_time,
      },
      targetStatus,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <ReservationCalendar
        rows={rows}
        month={month}
        today={today}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <DayReservationsPanel
        selectedDate={selectedDate}
        rows={dayRows}
        onRowClick={setDetailRow}
      />

      <ReservationDetailModal
        isOpen={detailRow !== null}
        onClose={() => setDetailRow(null)}
        row={detailRow}
        onRequestStatusChange={openDialogForRow}
      />

      <StatusChangeDialog
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        ids={dialog?.ids ?? []}
        summary={dialog?.summary ?? null}
        targetStatus={dialog?.targetStatus ?? "CONFIRMED"}
        onSuccess={() => setDetailRow(null)}
      />
    </div>
  );
}
