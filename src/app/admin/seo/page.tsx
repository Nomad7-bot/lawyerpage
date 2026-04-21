import { Tabs } from "@/components/ui/Tabs";
import { SeoPagesTabView } from "@/components/admin/seo/SeoPagesTabView";
import { SiteSettingsTabView } from "@/components/admin/seo/SiteSettingsTabView";
import { StructuredDataTabView } from "@/components/admin/seo/StructuredDataTabView";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

const TABS = [
  { key: "pages", label: "페이지별 SEO" },
  { key: "site", label: "사이트 기본 정보" },
  { key: "schema", label: "구조화 데이터" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function parseTab(raw: string | undefined): TabKey {
  if (raw === "site" || raw === "schema") return raw;
  return "pages";
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-h1 font-bold text-primary">SEO 설정</h1>
        <p className="mt-2 text-caption text-text-sub">
          페이지별 메타 태그 · 사이트 기본 정보 · 구조화 데이터 상태를 관리합니다
        </p>
      </header>

      <Tabs items={TABS} current={tab} />

      {tab === "pages" && <SeoPagesTabView />}
      {tab === "site" && <SiteSettingsTabView />}
      {tab === "schema" && <StructuredDataTabView />}
    </section>
  );
}
