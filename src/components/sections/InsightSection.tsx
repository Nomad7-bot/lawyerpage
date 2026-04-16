import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { PostWithRelations } from "@/types/database";

type InsightSectionProps = {
  posts: PostWithRelations[];
};

export function InsightSection({ posts }: InsightSectionProps) {
  return (
    <section className="py-16 md:py-22 bg-bg-light">
      <div className="container-content">
        <div className="flex items-end justify-between gap-4">
          <SectionTitle
            title="법률정보"
            subtitle="최신 판례와 법률 상식을 정리해드립니다"
            align="left"
          />
          <Link
            href="/insights"
            className="hidden md:inline-flex items-center gap-1 text-caption text-primary font-medium hover:text-accent transition-colors shrink-0"
          >
            전체보기
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}`}
              className="block group"
              aria-label={`${post.title} 게시글 읽기`}
            >
              <Card
                hover
                padding="none"
                className="overflow-hidden h-full flex flex-col"
              >
                {/* 16:9 썸네일 플레이스홀더 */}
                <div className="aspect-video bg-primary/5 flex items-center justify-center">
                  <FileText
                    className="h-10 w-10 text-primary/20"
                    aria-hidden
                  />
                </div>
                <div className="p-5 md:p-6 flex flex-col gap-3 flex-1">
                  {post.category && (
                    <div>
                      <Badge variant="category">{post.category.name}</Badge>
                    </div>
                  )}
                  <h3 className="text-h4 text-primary line-clamp-2 group-hover:text-primary-light transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-caption text-text-sub line-clamp-2 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  {post.published_at && (
                    <time
                      dateTime={post.published_at}
                      className="text-caption text-text-sub/70"
                    >
                      {format(new Date(post.published_at), "yyyy.MM.dd")}
                    </time>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 모바일 전체보기 */}
        <div className="mt-10 text-center md:hidden">
          <Link
            href="/insights"
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            전체보기
          </Link>
        </div>
      </div>
    </section>
  );
}
