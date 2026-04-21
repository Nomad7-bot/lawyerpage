/**
 * 예약 조회 페이지 전용 오버레이 래퍼.
 * 데스크톱: 화면 중앙, 모바일: 바텀시트 스타일.
 * 공용 Modal 컴포넌트와 달리 full-width bottom sheet 가 필요해 별도 분리.
 */
export function ReservationOverlay({
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
