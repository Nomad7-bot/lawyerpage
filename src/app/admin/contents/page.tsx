import { Tabs } from "@/components/ui/Tabs";
import { AttorneysTabView } from "@/components/admin/contents/AttorneysTabView";
import { PostsTabView } from "@/components/admin/contents/PostsTabView";
import { PracticeAreasTabView } from "@/components/admin/contents/PracticeAreasTabView";

import type { PostsFilter } from "@/lib/admin/posts";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

const TABS = [
  { key: "posts", label: "법률정보 관리" },
  { key: "attorneys", label: "변호사 관리" },
  { key: "practice-areas", label: "업무분야 관리" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function parseTab(raw: string | undefined): TabKey {
  if (raw === "attorneys" || raw === "practice-areas") return raw;
  return "posts";
}

function parsePostsFilter(sp: Record<string, string | undefined>): PostsFilter {
  const pageNum = Number(sp.page ?? "1");
  return {
    categoryId: sp.categoryId ?? "ALL",
    published:
      sp.published === "YES" || sp.published === "NO" ? sp.published : "ALL",
    q: sp.q,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

export default async function AdminContentsPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-h1 font-bold text-primary">콘텐츠 관리</h1>
        <p className="mt-2 text-caption text-text-sub">
          법률정보 · 변호사 · 업무분야 — 공개 페이지에 노출될 콘텐츠를 관리합니다
        </p>
      </header>

      <Tabs items={TABS} current={tab} />

      {tab === "posts" && <PostsTabView filter={parsePostsFilter(sp)} />}
      {tab === "attorneys" && <AttorneysTabView />}
      {tab === "practice-areas" && <PracticeAreasTabView />}
    </section>
  );
}
