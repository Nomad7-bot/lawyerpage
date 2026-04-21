import { SiteSettingsForm } from "@/components/admin/seo/SiteSettingsForm";
import { getSiteSettings } from "@/lib/admin/site-settings";

export async function SiteSettingsTabView() {
  const initial = await getSiteSettings();

  return (
    <div className="space-y-4">
      <p className="text-caption text-text-sub">
        사무소 정보(NAP), 영업시간, 기본 SEO 값, SNS 링크를 관리합니다. 저장 시
        공개 페이지 Footer 에 즉시 반영됩니다.
      </p>
      <SiteSettingsForm initial={initial} />
    </div>
  );
}
