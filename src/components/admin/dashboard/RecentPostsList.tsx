import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { DashboardSectionHeader } from "@/components/admin/dashboard/DashboardSectionHeader";

import type { RecentPost } from "@/lib/dashboard";

type RecentPostsListProps = {
  data: RecentPost[];
};

function formatCreatedAt(iso: string): string {
  // 서울 기준 YYYY.MM.DD 포맷
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // ko-KR → "2026. 04. 21." 형식이라 점/공백 정리
  return formatter.format(new Date(iso)).replace(/\s/g, "").replace(/\.$/, "");
}

export function RecentPostsList({ data }: RecentPostsListProps) {
  return (
    <section>
      <DashboardSectionHeader
        title="최근 게시글"
        subtitle="법률 정보 콘텐츠 현황"
        href="/admin/contents"
      />

      <div className="overflow-hidden rounded-card bg-bg-white">
        {data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FileText className="h-10 w-10 text-text-sub/40" />
            <p className="text-body font-medium text-text-main">
              등록된 게시글이 없습니다
            </p>
            <p className="text-caption text-text-sub">
              콘텐츠 관리에서 첫 글을 작성해보세요
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-bg-light">
            {data.map((post) => (
              <li
                key={post.id}
                className="px-6 py-5 transition-colors hover:bg-accent/5"
              >
                <h4 className="line-clamp-2 text-body font-semibold text-primary">
                  {post.title}
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {post.category_name ? (
                    <Badge variant="category">{post.category_name}</Badge>
                  ) : null}
                  <Badge
                    variant={post.is_published ? "confirmed" : "cancelled"}
                  >
                    {post.is_published ? "공개" : "비공개"}
                  </Badge>
                  <span className="text-caption text-text-sub">
                    {formatCreatedAt(post.created_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
