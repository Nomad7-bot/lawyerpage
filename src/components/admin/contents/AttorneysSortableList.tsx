"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GripVertical, Pencil, Trash2, UserCircle2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SortableList } from "@/components/admin/contents/SortableList";
import { useToast } from "@/components/admin/ToastProvider";
import {
  deleteAttorney,
  reorderAttorneys,
  toggleAttorneyActive,
} from "@/lib/admin/attorneys.actions";
import { cn } from "@/lib/utils/cn";

import type { AttorneyListItemAdmin } from "@/lib/admin/attorneys";

type Props = {
  items: AttorneyListItemAdmin[];
};

export function AttorneysSortableList({ items }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [deleting, setDeleting] = useState<AttorneyListItemAdmin | null>(null);
  const [localItems, setLocalItems] = useState(items);

  const handleReorder = async (nextIds: string[]) => {
    // 낙관적 업데이트
    const reordered = nextIds
      .map((id) => localItems.find((i) => i.id === id))
      .filter((x): x is AttorneyListItemAdmin => Boolean(x));
    setLocalItems(reordered);

    const result = await reorderAttorneys(nextIds);
    if (!result.ok) {
      toast.error(result.error);
      setLocalItems(items); // 롤백
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const result = await deleteAttorney(deleting.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("변호사가 삭제되었습니다");
    setDeleting(null);
    router.refresh();
  };

  const handleToggle = async (row: AttorneyListItemAdmin, next: boolean) => {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === row.id ? { ...i, is_active: next } : i))
    );
    const result = await toggleAttorneyActive(row.id, next);
    if (!result.ok) {
      toast.error(result.error);
      setLocalItems(items);
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white px-6 py-16 text-center">
        <p className="text-body text-text-sub">
          등록된 변호사가 없습니다. "변호사 추가" 버튼으로 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
        <SortableList
          items={localItems}
          onReorder={handleReorder}
          renderItem={(item, handle) => (
            <div className="flex items-center gap-4 px-4 py-3">
              <button
                type="button"
                {...handle.attributes}
                {...handle.listeners}
                aria-label="순서 변경"
                className={cn(
                  "flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-text-sub hover:text-primary",
                  handle.isDragging && "cursor-grabbing"
                )}
              >
                <GripVertical className="h-4 w-4" aria-hidden />
              </button>

              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-bg-light">
                {item.profile_image ? (
                  <Image
                    src={item.profile_image}
                    alt={`${item.name} 프로필`}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-sub">
                    <UserCircle2 className="h-6 w-6" aria-hidden />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-body font-semibold text-primary">
                  {item.name}
                </p>
                <p className="truncate text-caption text-text-sub">
                  {item.position ?? "직책 미입력"}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <span
                  className={cn(
                    "text-caption font-bold",
                    item.is_active ? "text-success" : "text-text-sub"
                  )}
                >
                  {item.is_active ? "활성" : "비활성"}
                </span>
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => handleToggle(item, e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-primary"
                  aria-label={`${item.name} 활성 토글`}
                />
              </label>

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/contents/attorneys/${item.id}/edit`}
                  aria-label={`${item.name} 수정`}
                  className="inline-flex h-8 w-8 items-center justify-center text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  aria-label={`${item.name} 삭제`}
                  className="inline-flex h-8 w-8 items-center justify-center text-text-sub transition-colors hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="변호사 삭제"
        message={
          deleting
            ? `"${deleting.name}" 변호사를 삭제하시겠습니까? 관련 업무분야 매핑과 가용 시간 정보가 모두 삭제됩니다.`
            : undefined
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
