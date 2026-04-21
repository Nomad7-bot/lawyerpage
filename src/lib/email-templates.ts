import { SITE } from "@/constants/site";
import { formatDateKo } from "@/lib/utils/date";

/**
 * 이메일 HTML 템플릿 모음
 *
 * - 모든 템플릿은 순수 함수 — 입력만으로 `{ subject, html }` 결정
 * - inline CSS + table 레이아웃 (Gmail/Outlook 호환)
 * - 브랜딩: primary #1B2A4A (navy), accent #C4A265 (gold)
 * - Footer에 SITE.nap 전체 노출 → NAP 일관성 유지 (PRD §7)
 */

type BuiltEmail = { subject: string; html: string };

// ─── 브랜딩 색상 (tailwind.config.ts 토큰과 1:1 일치) ─────────
const COLOR = {
  primary: "#1B2A4A",
  primaryLight: "#2E5C8A",
  accent: "#C4A265",
  textMain: "#2D2D2D",
  textSub: "#666666",
  bgLight: "#F5F5F5",
  bgWhite: "#FFFFFF",
  borderLight: "#E5E5E5",
} as const;

// ─── 공통 유틸 ───────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTimeShort(time: string): string {
  // "14:00:00" 또는 "14:00" → "14:00"
  return time.slice(0, 5);
}

type InfoRow = { label: string; value: string };

function renderInfoTable(rows: InfoRow[]): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      ${rows
        .map(
          (row) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${COLOR.borderLight};width:120px;color:${COLOR.textSub};font-size:14px;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 0;border-bottom:1px solid ${COLOR.borderLight};color:${COLOR.textMain};font-size:14px;vertical-align:top;">${escapeHtml(row.value)}</td>
        </tr>`
        )
        .join("")}
    </table>
  `;
}

function renderCtaButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
      <tr>
        <td style="background-color:${COLOR.primary};border-radius:8px;">
          <a href="${escapeHtml(href)}"
             style="display:inline-block;padding:14px 32px;color:${COLOR.bgWhite};
                    font-size:15px;font-weight:600;text-decoration:none;
                    border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

type WrapOptions = {
  title: string;
  intro: string;
  bodyHtml: string;
  cta?: { href: string; label: string };
  footerNote?: string;
};

function wrapLayout({ title, intro, bodyHtml, cta, footerNote }: WrapOptions): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR.bgLight};font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;color:${COLOR.textMain};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLOR.bgLight};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:${COLOR.bgWhite};border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:${COLOR.primary};padding:28px 32px;">
              <div style="color:${COLOR.bgWhite};font-size:13px;letter-spacing:2px;">${escapeHtml(SITE.name.toUpperCase())}</div>
              <div style="color:${COLOR.bgWhite};font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(title)}</div>
              <div style="height:3px;width:40px;background-color:${COLOR.accent};margin-top:12px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${COLOR.textMain};">
                ${intro}
              </p>
              ${bodyHtml}
              ${cta ? renderCtaButton(cta.href, cta.label) : ""}
              ${footerNote ? `<p style="margin:24px 0 0 0;padding:16px;background-color:${COLOR.bgLight};border-left:3px solid ${COLOR.accent};font-size:13px;line-height:1.6;color:${COLOR.textSub};">${footerNote}</p>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${COLOR.bgLight};padding:24px 32px;border-top:1px solid ${COLOR.borderLight};">
              <div style="font-size:13px;font-weight:700;color:${COLOR.primary};margin-bottom:8px;">${escapeHtml(SITE.nap.name)}</div>
              <div style="font-size:12px;line-height:1.6;color:${COLOR.textSub};">
                ${escapeHtml(SITE.nap.address)}<br />
                전화: ${escapeHtml(SITE.nap.phoneDisplay)} · 이메일: ${escapeHtml(SITE.nap.email)}<br />
                평일 ${escapeHtml(SITE.businessHours.weekday)} · 토요일 ${escapeHtml(SITE.businessHours.saturday)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── 1. 예약 접수 알림 (관리자 수신) ──────────────────────────

export function buildAdminNewReservationEmail(params: {
  reservation_no: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  attorney_name: string | null;
  practice_area_name: string | null;
  preferred_date: string;
  preferred_time: string;
  consultation_note: string | null;
}): BuiltEmail {
  const rows: InfoRow[] = [
    { label: "예약번호", value: params.reservation_no },
    { label: "신청자", value: params.client_name },
    { label: "연락처", value: params.client_phone },
    { label: "이메일", value: params.client_email },
    { label: "희망 변호사", value: params.attorney_name ?? "무관" },
    { label: "상담분야", value: params.practice_area_name ?? "-" },
    {
      label: "희망 일시",
      value: `${formatDateKo(params.preferred_date)} ${formatTimeShort(params.preferred_time)}`,
    },
    { label: "상담 내용", value: params.consultation_note?.trim() || "(입력된 내용 없음)" },
  ];

  const html = wrapLayout({
    title: "신규 예약 접수",
    intro: "새로운 상담 예약이 접수되었습니다. 아래 내용을 확인하고 확정/반려 처리해 주세요.",
    bodyHtml: renderInfoTable(rows),
    cta: { href: `${SITE.url}/admin/reservations`, label: "예약 관리 페이지로 이동" },
  });

  return {
    subject: `[${SITE.name}] 신규 예약 접수 ${params.reservation_no}`,
    html,
  };
}

// ─── 2. 예약 확정 안내 (사용자 수신) ──────────────────────────

export function buildUserConfirmedEmail(params: {
  reservation_no: string;
  client_name: string;
  attorney_name: string | null;
  preferred_date: string;
  preferred_time: string;
}): BuiltEmail {
  const rows: InfoRow[] = [
    { label: "예약번호", value: params.reservation_no },
    { label: "담당 변호사", value: params.attorney_name ?? "배정 예정" },
    {
      label: "상담 일시",
      value: `${formatDateKo(params.preferred_date)} ${formatTimeShort(params.preferred_time)}`,
    },
    { label: "장소", value: SITE.nap.address },
    { label: "연락처", value: SITE.nap.phoneDisplay },
  ];

  const html = wrapLayout({
    title: "예약이 확정되었습니다",
    intro: `${escapeHtml(params.client_name)} 고객님, 신청하신 상담 예약이 확정되었습니다. 예약 일시에 사무소로 방문해 주세요.`,
    bodyHtml: renderInfoTable(rows),
    footerNote:
      "예약 시간 10분 전까지 사무소 1층 안내 데스크에서 성함을 말씀해 주세요. 일정 변경이 필요하신 경우 전화 또는 예약 확인 페이지에서 직접 변경하실 수 있습니다.",
  });

  return {
    subject: `[${SITE.name}] 예약 확정 안내 ${params.reservation_no}`,
    html,
  };
}

// ─── 3. 예약 반려 안내 (사용자 수신) ──────────────────────────

export function buildUserRejectedEmail(params: {
  reservation_no: string;
  client_name: string;
  reject_reason: string | null;
}): BuiltEmail {
  const rows: InfoRow[] = [
    { label: "예약번호", value: params.reservation_no },
    { label: "반려 사유", value: params.reject_reason?.trim() || "관리자 확인 필요" },
  ];

  const html = wrapLayout({
    title: "예약이 반려되었습니다",
    intro: `${escapeHtml(params.client_name)} 고객님, 신청하신 상담 예약을 처리해 드리지 못한 점 진심으로 사과드립니다. 아래 사유를 확인하신 후 다시 예약해 주시기 바랍니다.`,
    bodyHtml: renderInfoTable(rows),
    cta: { href: `${SITE.url}/reservation`, label: "다시 예약하기" },
    footerNote:
      "추가 문의가 있으시면 사무소 대표번호로 연락 주시면 친절히 안내해 드리겠습니다.",
  });

  return {
    subject: `[${SITE.name}] 예약 반려 안내 ${params.reservation_no}`,
    html,
  };
}

// ─── 4. 예약 취소 알림 (관리자 수신) ──────────────────────────

export function buildAdminCancelledEmail(params: {
  reservation_no: string;
  client_name: string;
  preferred_date: string;
  preferred_time: string;
}): BuiltEmail {
  const rows: InfoRow[] = [
    { label: "예약번호", value: params.reservation_no },
    { label: "신청자", value: params.client_name },
    {
      label: "취소된 일시",
      value: `${formatDateKo(params.preferred_date)} ${formatTimeShort(params.preferred_time)}`,
    },
  ];

  const html = wrapLayout({
    title: "예약이 취소되었습니다",
    intro: "사용자가 예약 확인 페이지를 통해 예약을 취소하였습니다.",
    bodyHtml: renderInfoTable(rows),
    cta: { href: `${SITE.url}/admin/reservations`, label: "예약 관리 페이지로 이동" },
  });

  return {
    subject: `[${SITE.name}] 예약 취소 ${params.reservation_no}`,
    html,
  };
}

// ─── 5. 일정 변경 요청 알림 (관리자 수신) ────────────────────

export function buildAdminChangedEmail(params: {
  reservation_no: string;
  client_name: string;
  old_date: string;
  old_time: string;
  new_date: string;
  new_time: string;
}): BuiltEmail {
  const rows: InfoRow[] = [
    { label: "예약번호", value: params.reservation_no },
    { label: "신청자", value: params.client_name },
    {
      label: "기존 일시",
      value: `${formatDateKo(params.old_date)} ${formatTimeShort(params.old_time)}`,
    },
    {
      label: "변경 일시",
      value: `${formatDateKo(params.new_date)} ${formatTimeShort(params.new_time)}`,
    },
  ];

  const html = wrapLayout({
    title: "예약 일정이 변경되었습니다",
    intro: "사용자가 예약 확인 페이지를 통해 상담 일정을 변경하였습니다. 가용 여부를 확인해 주세요.",
    bodyHtml: renderInfoTable(rows),
    cta: { href: `${SITE.url}/admin/reservations`, label: "예약 관리 페이지로 이동" },
  });

  return {
    subject: `[${SITE.name}] 일정 변경 ${params.reservation_no}`,
    html,
  };
}
