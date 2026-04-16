"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { formatDateTimeKo } from "@/lib/utils/date";
import { useReservationStore } from "@/store/reservationStore";
import { useAttorneys, usePracticeAreas } from "@/hooks/useReservation";

type SummaryRowProps = { label: string; value: string };

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 gap-1 sm:gap-4 border-b border-bg-light last:border-0">
      <span className="text-caption font-medium text-text-sub w-24 shrink-0">
        {label}
      </span>
      <span className="text-body font-medium text-primary">{value}</span>
    </div>
  );
}

export function Step4Confirm() {
  const {
    reservationNumber,
    selectedAttorneySlug,
    selectedDate,
    selectedTime,
    formData,
    reset,
  } = useReservationStore();

  const { data: attorneys } = useAttorneys();
  const { data: practiceAreas } = usePracticeAreas();

  // 변호사명 resolve (캐시에서)
  const attorney =
    selectedAttorneySlug && attorneys
      ? attorneys.find((a) => a.slug === selectedAttorneySlug)
      : null;

  const attorneyLabel = attorney
    ? `${attorney.name} ${attorney.position}`
    : "담당 변호사 자동 배정";

  const dateTimeLabel =
    selectedDate && selectedTime
      ? formatDateTimeKo(selectedDate, selectedTime)
      : "";

  // 상담분야명 resolve (formData.topic은 이제 UUID)
  const topicId = formData.topic as string | undefined;
  const topicLabel =
    topicId && practiceAreas
      ? (practiceAreas.find((pa) => pa.id === topicId)?.name ?? "")
      : "";

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* 체크 아이콘 */}
      <div className="flex justify-center">
        <CheckCircle2
          className="w-16 h-16 text-accent"
          aria-hidden
          strokeWidth={1.5}
        />
      </div>

      <h2 className="mt-5 text-h2 font-bold text-primary">
        예약 신청이 완료되었습니다
      </h2>
      <p className="mt-3 text-body text-text-sub">
        담당자 확인 후 예약이 확정됩니다.
        <br className="hidden sm:block" />
        확정 시 문자 및 이메일로 안내드립니다.
      </p>

      {/* 예약 요약 카드 */}
      <div className="mt-8 text-left rounded-card border border-bg-light overflow-hidden">
        <div className="bg-primary px-5 py-3">
          <p className="text-caption font-semibold text-bg-white/70">
            예약 접수 내역
          </p>
        </div>
        <div className="px-5">
          <SummaryRow label="예약번호" value={reservationNumber ?? "-"} />
          <SummaryRow label="담당 변호사" value={attorneyLabel} />
          <SummaryRow label="상담 일시" value={dateTimeLabel} />
          <SummaryRow label="상담 분야" value={topicLabel} />
        </div>
      </div>

      {/* 버튼 */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/reservation/check"
          className={buttonStyles({
            variant: "secondary",
            size: "lg",
            fullWidth: false,
            className: "w-full sm:w-auto",
          })}
        >
          예약 조회하기
        </Link>
        <Link
          href="/"
          onClick={reset}
          className={buttonStyles({
            variant: "ghost",
            size: "lg",
            className: "w-full sm:w-auto",
          })}
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
