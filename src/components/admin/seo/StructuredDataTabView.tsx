import { ExternalLink } from "lucide-react";

import { StructuredDataCard } from "@/components/admin/seo/StructuredDataCard";
import { getSiteSettings } from "@/lib/admin/site-settings";
import { getStructuredDataStatus } from "@/lib/admin/structured-data";

export async function StructuredDataTabView() {
  const site = await getSiteSettings();
  const statuses = await getStructuredDataStatus(site);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-caption text-text-sub">
          사이트에 적용될 <strong>JSON-LD 구조화 데이터</strong>의 상태를
          확인합니다. 실제 마크업은 Phase 4 SEO 작업에서 공개 페이지에 자동
          주입됩니다. 카드별로 스니펫을 미리 보고 복사할 수 있습니다.
        </p>
        <a
          href="https://search.google.com/test/rich-results"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-card border border-bg-light bg-bg-white px-4 text-caption font-bold text-primary transition-colors hover:border-accent"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          Google Rich Results Test
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((s) => (
          <StructuredDataCard key={s.key} status={s} />
        ))}
      </div>
    </div>
  );
}
