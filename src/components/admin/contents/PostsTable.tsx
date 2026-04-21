"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ToastProvider";
import { deletePost } from "@/lib/admin/posts.actions";
import { cn } from "@/lib/utils/cn";

import type { PostRow } from "@/lib/admin/posts";

type Props = {
  rows: PostRow[];
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(iso))
    .replace(/\s/g, "")
    .replace(/\.$/, "");
}

export function PostsTable({ rows }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [deleting, setDeleting] = useState<PostRow | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    const result = await deletePost(deleting.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("게시글이 삭제되었습니다");
    setDeleting(null);
    router.refresh();
  };

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white px-6 py-16 text-center">
        <p className="text-body text-text-sub">조회된 게시글이 없습니다</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-card border border-bg-light bg-bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-light">
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  제목
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  카테고리
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  상태
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  작성일
                </th>
                <th className="px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  조회수
                </th>
                <th className="w-24 px-4 py-3 text-caption font-bold uppercase tracking-wider text-primary">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-light">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-accent/5"
                >
                  <td className="max-w-md px-4 py-3 text-caption font-semibold text-primary">
                    <Link
                      href={`/admin/contents/posts/${row.id}/edit`}
                      className="line-clamp-1 underline-offset-4 hover:text-accent hover:underline"
                    >
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main">
                    {row.category_name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-caption font-bold",
                        row.is_published ? "text-success" : "text-text-sub"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          row.is_published ? "bg-success" : "bg-text-sub/60"
                        )}
                      />
                      {row.is_published ? "공개" : "비공개"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main tabular-nums">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 text-caption text-text-main tabular-nums">
                    {row.view_count.toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/contents/posts/${row.id}/edit`}
                        aria-label={`${row.title} 수정`}
                        className="inline-flex h-8 w-8 items-center justify-center text-text-sub transition-colors hover:bg-accent/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleting(row)}
                        aria-label={`${row.title} 삭제`}
                        className="inline-flex h-8 w-8 items-center justify-center text-text-sub transition-colors hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        title="게시글 삭제"
        message={
          deleting
            ? `"${deleting.title}" 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : undefined
        }
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
