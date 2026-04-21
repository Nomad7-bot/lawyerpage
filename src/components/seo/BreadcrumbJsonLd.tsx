import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbListSchema } from "@/lib/schema";
import type { BreadcrumbSchemaItem } from "@/lib/schema";

type BreadcrumbJsonLdProps = {
  /** Breadcrumb UI 컴포넌트에 전달하는 동일한 items 를 그대로 사용 가능 */
  items: BreadcrumbSchemaItem[];
};

/**
 * Breadcrumb UI 와 쌍으로 사용하는 JSON-LD 래퍼.
 * UI(Breadcrumb) 는 variant/separator 등 표현 책임, 이 컴포넌트는 SEO 책임만 담당.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <JsonLd
      data={buildBreadcrumbListSchema(items)}
      id="schema-breadcrumb"
    />
  );
}
