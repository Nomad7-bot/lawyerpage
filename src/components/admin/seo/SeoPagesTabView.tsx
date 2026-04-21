import { SeoPagesTable } from "@/components/admin/seo/SeoPagesTable";
import { getSeoSettings } from "@/lib/admin/seo";
import { SITE } from "@/constants/site";

export async function SeoPagesTabView() {
  const rows = await getSeoSettings();

  return (
    <div className="space-y-4">
      <p className="text-caption text-text-sub">
        각 페이지의 Meta/OG 태그를 개별 설정합니다. 행을 클릭하면 오른쪽 패널에서
        편집할 수 있습니다.
      </p>
      <SeoPagesTable siteUrl={SITE.url} rows={rows} />
    </div>
  );
}
