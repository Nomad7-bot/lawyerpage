import { MapPin } from "lucide-react";

type GoogleMapProps = {
  /** Google Maps → 공유 → 지도 퍼가기 에서 얻은 embed URL (src 속성) */
  embedUrl?: string;
  /** 접근성·SEO 를 위한 iframe title */
  title: string;
  /** "Google Maps에서 보기" 링크용 주소 텍스트 */
  fallbackAddress: string;
  /** 표시 높이 (px). CLS 방지를 위해 고정 */
  height?: number;
  className?: string;
};

/**
 * Google Maps Embed iframe — API Key 불필요 (Embed URL 방식).
 * env NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL 또는 prop 으로 URL 주입.
 * URL 이 없을 때는 기존 placeholder + "Google Maps 에서 보기" 링크 로 graceful fallback.
 *
 * Performance:
 * - `loading="lazy"` : 뷰포트 진입 시에만 로드 (LCP/TBT 보호)
 * - `referrerPolicy="no-referrer-when-downgrade"` : 권장 설정
 * - 고정 height 로 CLS 방지
 */
export function GoogleMap({
  embedUrl,
  title,
  fallbackAddress,
  height = 480,
  className,
}: GoogleMapProps) {
  const url = embedUrl ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  if (!url) {
    return (
      <div
        className={className}
        style={{ height }}
        role="region"
        aria-label={title}
      >
        <div className="h-full bg-primary/10 flex flex-col items-center justify-center gap-3">
          <MapPin className="w-10 h-10 text-primary/30" aria-hidden />
          <p className="text-body text-text-sub">
            Google Maps (API 키 연결 후 활성화)
          </p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(fallbackAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption text-primary-light underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
          >
            Google Maps에서 보기 ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <iframe
        src={url}
        title={title}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full h-full"
      />
    </div>
  );
}
