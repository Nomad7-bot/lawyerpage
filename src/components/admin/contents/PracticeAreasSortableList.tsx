"use client";

import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { GripVertical, Pencil, Square, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SortableList } from "@/components/admin/contents/SortableList";
import { useToast } from "@/components/admin/ToastProvider";
import {
  deletePracticeArea,
  reorderPracticeAreas,
  togglePracticeAreaActive,
} from "@/lib/admin/practice-areas.actions";
import { cn } from "@/lib/utils/cn";

import type { PracticeAreaListItemAdmin } from "@/lib/admin/practice-areas";

type Props = {
  items: PracticeAreaListItemAdmin[];
};

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return Square;
  const registry = LucideIcons as unknown as Record<string, LucideIcon>;
  return registry[name] ?? Square;
}

export function PracticeAreasSortableList({ items }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [localItems, setLocalItems] = useState(items);
  const [deleting, setDeleting] = useState<PracticeAreaListItemAdmin | null>(
    null
  );

  const handleReorder = async (nextIds: string[]) => {
    const reordered = nextIds
      .map((id) => localItems.find((i) => i.id === id))
      .filter((x): x is PracticeAreaListItemAdmin => Boolean(x));
    setLocalItems(reordered);

    const result = await reorderPracticeAreas(nextIds);
    if (!result.ok) {
      toast.error(result.error);
      setLocalItems(items);
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const result = await deletePracticeArea(deleting.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("업무분야가 삭제되었습니다");
    setDeleting(null);
    router.refresh();
  };

  const handleToggle = async (
    row: PracticeAreaListItemAdmin,
    next: boolean
  ) => {
    setLocalItems((prev) =>
      prev.map((i) => (i.id === row.id ? { ...i, is_active: next } : i))
    );
    const result = await togglePracticeAreaActive(row.id, next);
    if (!result.ok) {
      toast.error(result.error);
      setLocalItems(items);
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white px-6 py-16 text-center">
        <p className="text-body text-text-sub">
          등록된 업무분야가 없습니다. "업무분야 추가" 버튼으로 시작하세요.
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
          renderItem={(item, handle) => {
            const Icon = resolveIcon(item.icon_name);
            return (
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

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-bg-light">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-body font-semibold text-primary">
                    {item.name}
                  </p>
                  <p className="truncate font-mono text-caption text-text-sub">
                    /{item.slug}
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
                    href={`/admin/contents/practice-areas/${item.id}/edit`}
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
            );
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="업무분야 삭제"
        message={
          deleting
            ? `"${deleting.name}" 업무분야를 삭제하시겠습니까? 변호사와의 연결도 함께 제거됩니다.`
            : undefined
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
