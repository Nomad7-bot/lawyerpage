"use client";

import { useState } from "react";

import { BulkActionBar } from "@/components/admin/reservations/BulkActionBar";
import { Pagination } from "@/components/admin/reservations/Pagination";
import { ReservationDetailModal } from "@/components/admin/reservations/ReservationDetailModal";
import { ReservationTable } from "@/components/admin/reservations/ReservationTable";
import {
  StatusChangeDialog,
  type StatusChangeSummary,
  type StatusChangeTarget,
} from "@/components/admin/reservations/StatusChangeDialog";

import type { AdminReservationRow } from "@/lib/admin/reservations";

type ListShellProps = {
  rows: AdminReservationRow[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: "created_at" | "preferred_date";
  sortOrder: "asc" | "desc";
};

type DialogState =
  | {
      ids: string[];
      summary: StatusChangeSummary | null;
      targetStatus: StatusChangeTarget;
    }
  | null;

/**
 * 리스트 뷰의 상태를 조율하는 Client 컨테이너:
 * - 체크박스 선택 상태
 * - 상세 모달 open
 * - 상태 변경 다이얼로그 (단건/bulk 통합)
 */
export function ReservationListShell({
  rows,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
}: ListShellProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailRow, setDetailRow] = useState<AdminReservationRow | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);

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

  const openBulkDialog = (targetStatus: StatusChangeTarget) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDialog({ ids, summary: null, targetStatus });
  };

  const handleDialogSuccess = () => {
    setSelectedIds(new Set());
    setDetailRow(null);
  };

  return (
    <div className="space-y-4">
      <BulkActionBar
        count={selectedIds.size}
        onBulkConfirm={() => openBulkDialog("CONFIRMED")}
        onBulkReject={() => openBulkDialog("REJECTED")}
        onClear={() => setSelectedIds(new Set())}
      />

      <ReservationTable
        rows={rows}
        sortBy={sortBy}
        sortOrder={sortOrder}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onDetailClick={setDetailRow}
      />

      <Pagination page={page} pageSize={pageSize} total={total} />

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
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
