import Link from "next/link";
import { Plus } from "lucide-react";

import { PracticeAreasSortableList } from "@/components/admin/contents/PracticeAreasSortableList";
import { getPracticeAreasAdmin } from "@/lib/admin/practice-areas";

export async function PracticeAreasTabView() {
  const items = await getPracticeAreasAdmin();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-text-sub">
          총 {items.length.toLocaleString("ko-KR")}개 · 드래그로 순서를 변경할 수
          있습니다
        </p>
        <Link
          href="/admin/contents/practice-areas/new"
          className="inline-flex h-10 items-center gap-1.5 bg-primary px-4 text-caption font-bold text-bg-white transition-colors hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" aria-hidden />업무분야 추가
        </Link>
      </div>

      <PracticeAreasSortableList items={items} />
    </div>
  );
}
