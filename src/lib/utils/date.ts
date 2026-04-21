const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * Date 객체를 "YYYY-MM-DD" 문자열로 변환
 */
export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * "YYYY-MM-DD" → "YYYY년 M월 D일 (요일)"
 */
export function formatDateKo(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  const date = new Date(`${y}-${m}-${d}`);
  const weekday = WEEKDAYS_KO[date.getDay()];
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일 (${weekday})`;
}

/**
 * "YYYY-MM-DD" + "HH:MM" → "YYYY년 M월 D일 (요일) HH:MM"
 */
export function formatDateTimeKo(ymd: string, time: string): string {
  return `${formatDateKo(ymd)} ${time}`;
}

/**
 * ISO 문자열 → "YYYY년 M월 D일" (요일 없음, Intl.DateTimeFormat 기반).
 * 게시글 발행일, 예약 신청일 등 요일이 필요 없는 노출에 사용.
 */
export function formatDateLocaleKo(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 예약번호 생성: "YYMMDD-XXXX"
 * Phase 1 전용 — Phase 2에서 서버 API로 교체
 */
export function generateReservationNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${yy}${mm}${dd}-${rand}`;
}

export { WEEKDAYS_KO };
