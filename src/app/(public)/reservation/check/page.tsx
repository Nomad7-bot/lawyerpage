"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { ReservationStatus } from "@/types/index";

// ── 더미 예약 데이터 ────────────────────────────────────────────
type DummyReservation = {
  id: string;
  status: ReservationStatus;
  name: string;
  phone: string;
  attorney: string;
  topic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  appliedAt: string; // YYYY-MM-DD
  rejectionReason?: string;
};

const DUMMY_RESERVATIONS: Record<string, DummyReservation> = {
  "260406-1001": {
    id: "260406-1001",
    status: "PENDING",
    name: "홍길동",
    phone: "010-1234-5678",
    attorney: "김대표 대표변호사",
    topic: "민사소송",
    date: "2026-04-10",
    time: "14:00",
    appliedAt: "2026-04-06",
  },
  "260406-1002": {
    id: "260406-1002",
    status: "CONFIRMED",
    name: "이영희",
    phone: "010-9876-5432",
    attorney: "이파트너 파트너변호사",
    topic: "형사사건",
    date: "2026-04-15",
    time: "10:00",
    appliedAt: "2026-04-06",
  },
  "260406-1003": {
    id: "260406-1003",
    status: "CANCELLED",
    name: "박철수",
    phone: "010-5555-1234",
    attorney: "박변호사 파트너변호사",
    topic: "부동산",
    date: "2026-03-20",
    time: "15:00",
    appliedAt: "2026-03-15",
  },
  "260406-1004": {
    id: "260406-1004",
    status: "REJECTED",
    name: "최민준",
    phone: "010-7777-8888",
    attorney: "최변호사 변호사",
    topic: "노동·산재",
    date: "2026-03-25",
    time: "11:00",
    appliedAt: "2026-03-20",
    rejectionReason:
      "요청하신 시간에 담당 변호사의 선행 일정이 확정되어 있어 예약이 어렵습니다. 다른 일정으로 다시 예약해 주시기 바랍니다.",
  },
};

// ── 상태 뱃지 매핑 ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; variant: "pending" | "confirmed" | "cancelled" | "rejected" }
> = {
  PENDING: { label: "접수 대기중", variant: "pending" },
  CONFIRMED: { label: "예약 확정", variant: "confirmed" },
  CANCELLED: { label: "예약 취소됨", variant: "cancelled" },
  REJECTED: { label: "예약 반려", variant: "rejected" },
  COMPLETED: { label: "상담 완료", variant: "confirmed" },
};

// ── 날짜 포맷 유틸 ─────────────────────────────────────────────
function formatDateKo(ymd: string) {
  const [y, m, d] = ymd.split("-");
  const date = new Date(`${y}-${m}-${d}`);
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${weekday})`;
}

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ── 시간 슬롯 (더미) ───────────────────────────────────────────
const TIME_SLOTS = [
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: false },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
  { time: "17:00", available: true },
];

// ── 요약 정보 행 컴포넌트 ──────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-bg-light last:border-0">
      <span className="text-caption text-text-sub w-24 shrink-0">{label}</span>
      <span className="text-body font-medium text-primary">{value}</span>
    </div>
  );
}

// ── 미니 캘린더 (변경 모달용) ──────────────────────────────────
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null;
  onSelect: (ymd: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function isDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (d < today) return true;
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-bg-light rounded-card"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-4 h-4 text-text-sub" aria-hidden />
        </button>
        <span className="text-body font-semibold text-primary">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center hover:bg-bg-light rounded-card"
          aria-label="다음 달"
        >
          <ChevronRight className="w-4 h-4 text-text-sub" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "text-center text-caption font-medium py-1",
              i === 0 && "text-error",
              i === 6 && "text-primary-light"
            )}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const ymd = toYMD(new Date(viewYear, viewMonth, day));
          const disabled = isDisabled(day);
          const isSelected = selectedDate === ymd;
          const isSun = new Date(viewYear, viewMonth, day).getDay() === 0;
          const isSat = new Date(viewYear, viewMonth, day).getDay() === 6;
          return (
            <button
              key={ymd}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(ymd)}
              className={cn(
                "h-9 w-full rounded-card text-caption transition-colors",
                isSelected && "bg-primary text-bg-white font-semibold",
                !isSelected && !disabled && "hover:bg-bg-light",
                !isSelected && !disabled && isSun && "text-error",
                !isSelected && !disabled && isSat && "text-primary-light",
                !isSelected && !disabled && !isSun && !isSat && "text-text-main",
                disabled && "text-text-sub/30 cursor-not-allowed"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 오버레이 모달 래퍼 (데스크톱: 중앙, 모바일: 바텀시트) ──────
function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md bg-bg-white rounded-t-2xl sm:rounded-none shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════════════════════════
export default function ReservationCheckPage() {
  const [searchNum, setSearchNum] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [result, setResult] = useState<DummyReservation | null>(null);
  const [notFound, setNotFound] = useState(false);

  // 모달 상태
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeDate, setChangeDate] = useState<string | null>(null);
  const [changeTime, setChangeTime] = useState<string | null>(null);
  const [changeDone, setChangeDone] = useState(false);

  function handleSearch() {
    // 폼 검증
    if (!searchNum.trim() || !searchPhone.trim()) {
      setSearchError("예약번호와 연락처를 모두 입력해주세요.");
      return;
    }
    setSearchError(null);

    const found = DUMMY_RESERVATIONS[searchNum.trim()];
    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  }

  function handleReset() {
    setResult(null);
    setNotFound(false);
    setSearchNum("");
    setSearchPhone("");
    setChangeDone(false);
  }

  function handleCancelConfirm() {
    if (!result) return;
    setResult({ ...result, status: "CANCELLED" });
    setShowCancelModal(false);
  }

  function handleChangeConfirm() {
    if (!result || !changeDate || !changeTime) return;
    setResult({ ...result, date: changeDate, time: changeTime });
    setChangeDone(true);
    setShowChangeModal(false);
    setChangeDate(null);
    setChangeTime(null);
  }

  const statusConfig = result ? STATUS_CONFIG[result.status] : null;

  return (
    <>
      <main>
        {/* Page Header Banner */}
        <section className="bg-primary flex flex-col justify-center min-h-[200px]">
          <div className="container-content py-10">
            <Breadcrumb
              items={[
                { label: "홈", href: "/" },
                { label: "상담 예약", href: "/reservation" },
                { label: "예약 조회" },
              ]}
              variant="dark"
            />
            <h1 className="mt-4 text-h1 font-bold text-bg-white">예약 조회</h1>
            <p className="mt-2 text-body text-bg-white/70">
              예약번호와 연락처로 상담 예약 상태를 확인하세요.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-bg-light min-h-[60vh]">
          <div className="container-content max-w-xl">

            {/* ── 검색 결과가 없을 때: 조회 폼 ── */}
            {!result && (
              <div className="step-enter">
                {/* 안내 텍스트 */}
                <p className="mb-6 text-body text-text-sub text-center">
                  예약번호와 신청 시 입력한 연락처를 입력하면 예약 상태를 확인할
                  수 있습니다.
                </p>

                <div className="bg-bg-white rounded-card p-6 shadow-sm space-y-4">
                  <Input
                    label="예약번호 *"
                    placeholder="예: 260406-1001"
                    value={searchNum}
                    onChange={(e) => {
                      setSearchNum(e.target.value);
                      setSearchError(null);
                      setNotFound(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Input
                    label="연락처 *"
                    placeholder="예: 010-0000-0000"
                    value={searchPhone}
                    onChange={(e) => {
                      setSearchPhone(e.target.value);
                      setSearchError(null);
                      setNotFound(false);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    inputMode="tel"
                  />

                  {/* 오류 메시지 */}
                  {searchError && (
                    <p className="text-caption text-error" role="alert">
                      {searchError}
                    </p>
                  )}
                  {notFound && (
                    <p className="text-caption text-error" role="alert">
                      예약 정보를 찾을 수 없습니다. 예약번호와 연락처를 다시
                      확인해주세요.
                    </p>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" aria-hidden />
                    조회하기
                  </Button>
                </div>

                {/* 테스트 안내 */}
                <div className="mt-6 p-4 bg-primary/5 rounded-card border border-primary/10">
                  <p className="text-caption font-semibold text-primary mb-2">
                    테스트 예약번호 (Phase 1 더미 데이터)
                  </p>
                  <ul className="space-y-1 text-caption text-text-sub">
                    <li>
                      <span className="font-medium text-text-main">260406-1001</span>{" "}
                      → 접수 대기중 (변경/취소 가능)
                    </li>
                    <li>
                      <span className="font-medium text-text-main">260406-1002</span>{" "}
                      → 예약 확정 (취소만 가능)
                    </li>
                    <li>
                      <span className="font-medium text-text-main">260406-1003</span>{" "}
                      → 예약 취소됨
                    </li>
                    <li>
                      <span className="font-medium text-text-main">260406-1004</span>{" "}
                      → 예약 반려 (사유 포함)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── 조회 결과 ── */}
            {result && statusConfig && (
              <div className="step-enter">
                {/* 변경 완료 알림 */}
                {changeDone && (
                  <div className="mb-4 flex items-center gap-2 bg-success/10 border border-success/30 text-success rounded-card px-4 py-3 text-body">
                    <CalendarDays className="w-4 h-4 shrink-0" aria-hidden />
                    일정 변경 요청이 접수되었습니다. 확인 후 안내드립니다.
                  </div>
                )}

                <div className="bg-bg-white rounded-card shadow-sm overflow-hidden">
                  {/* 결과 헤더 */}
                  <div className="px-6 py-4 border-b border-bg-light flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-caption text-text-sub">
                        예약번호
                      </span>
                      <span className="text-body font-semibold text-primary">
                        {result.id}
                      </span>
                    </div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* 예약 정보 */}
                  <div className="px-6 py-2">
                    <InfoRow label="신청일" value={result.appliedAt} />
                    <InfoRow label="신청자" value={result.name} />
                    <InfoRow label="담당 변호사" value={result.attorney} />
                    <InfoRow label="상담 분야" value={result.topic} />
                    <InfoRow
                      label="상담 일시"
                      value={`${formatDateKo(result.date)} ${result.time}`}
                    />
                  </div>

                  {/* 반려 사유 */}
                  {result.status === "REJECTED" && result.rejectionReason && (
                    <div className="mx-6 mb-4 p-4 bg-error/5 border border-error/20 rounded-card">
                      <p className="text-caption font-semibold text-error mb-1">
                        반려 사유
                      </p>
                      <p className="text-body text-text-main">
                        {result.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  {(result.status === "PENDING" ||
                    result.status === "CONFIRMED") && (
                    <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-3">
                      {result.status === "PENDING" && (
                        <Button
                          variant="secondary"
                          size="md"
                          fullWidth
                          onClick={() => {
                            setChangeDone(false);
                            setChangeDate(null);
                            setChangeTime(null);
                            setShowChangeModal(true);
                          }}
                        >
                          일정 변경 요청
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="md"
                        fullWidth
                        onClick={() => setShowCancelModal(true)}
                      >
                        예약 취소
                      </Button>
                    </div>
                  )}
                </div>

                {/* 다시 조회 */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-body text-primary-light underline hover:text-primary transition-colors"
                  >
                    다른 예약 조회하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── 취소 확인 모달 ── */}
      {showCancelModal && (
        <Overlay onClose={() => setShowCancelModal(false)}>
          {/* 모바일 드래그 핸들 */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-bg-light rounded-full" aria-hidden />
          </div>

          <div className="p-6">
            {/* 닫기 버튼 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                  <AlertTriangle
                    className="w-5 h-5 text-error"
                    aria-hidden
                  />
                </div>
                <h2 className="text-h4 font-bold text-primary">
                  예약을 취소하시겠습니까?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="p-1 text-text-sub hover:text-text-main transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <p className="text-body text-text-sub mb-6">
              이 작업은 되돌릴 수 없습니다. 예약을 취소하면 현재 상담 일정이
              즉시 해제되며, 재예약이 필요합니다.
            </p>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => setShowCancelModal(false)}
              >
                돌아가기
              </Button>
              <Button
                variant="danger"
                size="lg"
                fullWidth
                onClick={handleCancelConfirm}
              >
                예약 취소
              </Button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── 일정 변경 모달 ── */}
      {showChangeModal && (
        <Overlay onClose={() => setShowChangeModal(false)}>
          {/* 모바일 드래그 핸들 */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-bg-light rounded-full" aria-hidden />
          </div>

          <div className="p-6 max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-h4 font-bold text-primary">일정 변경 요청</h2>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="p-1 text-text-sub hover:text-text-main transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {/* 현재 예약 */}
            {result && (
              <div className="mb-5 p-3 bg-bg-light rounded-card text-caption text-text-sub">
                현재 일정:{" "}
                <span className="text-text-main font-medium">
                  {formatDateKo(result.date)} {result.time}
                </span>
              </div>
            )}

            {/* 캘린더 */}
            <div className="mb-5">
              <p className="text-caption font-semibold text-text-main mb-3">
                새 날짜 선택
              </p>
              <MiniCalendar
                selectedDate={changeDate}
                onSelect={(ymd) => {
                  setChangeDate(ymd);
                  setChangeTime(null);
                }}
              />
            </div>

            {/* 시간 슬롯 */}
            {changeDate && (
              <div className="mb-6">
                <p className="text-caption font-semibold text-text-main mb-3">
                  시간 선택
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(({ time, available }) => (
                    <button
                      key={time}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setChangeTime(time)}
                      className={cn(
                        "h-10 rounded-card text-caption font-medium transition-colors",
                        changeTime === time && "bg-accent text-bg-white",
                        changeTime !== time &&
                          available &&
                          "border border-primary text-primary hover:bg-primary/5",
                        !available &&
                          "bg-bg-light text-text-sub/50 cursor-not-allowed"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => setShowChangeModal(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!changeDate || !changeTime}
                onClick={handleChangeConfirm}
              >
                변경 요청하기
              </Button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
}
