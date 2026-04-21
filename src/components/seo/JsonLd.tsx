import type { AnySchema } from "@/types/schema";

type JsonLdProps = {
  data: AnySchema;
  /** 중복 방지를 위한 식별자 (페이지별 고유) */
  id?: string;
};

/**
 * JSON-LD 구조화 데이터 삽입 Server Component (PRD §7 AEO)
 *
 * next/script 미사용 — SEO 크롤러가 초기 HTML 에서 파싱해야 하므로
 * `strategy="afterInteractive"` 로 지연 로드되면 안 된다.
 * XSS 방어: `</` 를 `\u003c` 로 치환해 `</script>` 조기 종료 차단.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
