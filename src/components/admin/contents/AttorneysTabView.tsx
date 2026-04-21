import Link from "next/link";
import { Plus } from "lucide-react";

import { AttorneysSortableList } from "@/components/admin/contents/AttorneysSortableList";
import { getAttorneysAdmin } from "@/lib/admin/attorneys";

export async function AttorneysTabView() {
  const items = await getAttorneysAdmin();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-text-sub">
          총 {items.length.toLocaleString("ko-KR")}명 · 드래그로 순서를 변경할 수
          있습니다
        </p>
        <Link
          href="/admin/contents/attorneys/new"
          className="inline-flex h-10 items-center gap-1.5 bg-primary px-4 text-caption font-bold text-bg-white transition-colors hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" aria-hidden />변호사 추가
        </Link>
      </div>

      <AttorneysSortableList items={items} />
    </div>
  );
}
