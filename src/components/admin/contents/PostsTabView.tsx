import Link from "next/link";
import { Plus } from "lucide-react";

import { Pagination } from "@/components/admin/reservations/Pagination";
import { PostsFilter } from "@/components/admin/contents/PostsFilter";
import { PostsTable } from "@/components/admin/contents/PostsTable";

import {
  getPostCategories,
  getPosts,
  POSTS_PAGE_SIZE,
  type PostsFilter as PostsFilterType,
} from "@/lib/admin/posts";

type Props = {
  filter: PostsFilterType;
};

export async function PostsTabView({ filter }: Props) {
  const [categories, list] = await Promise.all([
    getPostCategories(),
    getPosts(filter),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-caption text-text-sub">
          전체 {list.total.toLocaleString("ko-KR")}건
        </p>
        <Link
          href="/admin/contents/posts/new"
          className="inline-flex h-10 items-center gap-1.5 bg-primary px-4 text-caption font-bold text-bg-white transition-colors hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" aria-hidden />새 글 작성
        </Link>
      </div>

      <PostsFilter initial={filter} categories={categories} />
      <PostsTable rows={list.rows} />
      <Pagination
        page={list.page}
        pageSize={POSTS_PAGE_SIZE}
        total={list.total}
      />
    </div>
  );
}
