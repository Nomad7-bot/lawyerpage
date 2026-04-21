/**
 * 예약 조회 결과의 2-column 정보 행 (label + value).
 * 모바일에서는 세로 스택, sm 이상에서 가로 정렬.
 */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-bg-light last:border-0">
      <span className="text-caption text-text-sub w-24 shrink-0">{label}</span>
      <span className="text-body font-medium text-primary">{value}</span>
    </div>
  );
}
