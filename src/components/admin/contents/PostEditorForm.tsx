"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, FileEdit } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SlugInput } from "@/components/admin/contents/SlugInput";
import { TagInput } from "@/components/admin/contents/TagInput";
import { TiptapEditor } from "@/components/admin/contents/TiptapEditor";
import { useToast } from "@/components/admin/ToastProvider";

import { createPost, updatePost } from "@/lib/admin/posts.actions";

import type { Post, PostCategory } from "@/types";

type PostEditorFormProps = {
  mode: "create" | "edit";
  initial: Post | null;
  categories: PostCategory[];
  authors: { id: string; name: string }[];
};

type DraftState = {
  title: string;
  slug: string;
  category_id: string;
  content: string;
  excerpt: string;
  thumbnail: string | null;
  og_image: string | null;
  tags: string[];
  author_id: string;
  is_published: boolean;
  published_at: string;
  meta_title: string;
  meta_description: string;
};

function fromInitial(initial: Post | null): DraftState {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    category_id: initial?.category_id ?? "",
    content: initial?.content ?? "",
    excerpt: initial?.excerpt ?? "",
    thumbnail: initial?.thumbnail ?? null,
    og_image: initial?.og_image ?? null,
    tags: initial?.tags ?? [],
    author_id: initial?.author_id ?? "",
    is_published: initial?.is_published ?? false,
    published_at: initial?.published_at ?? "",
    meta_title: initial?.meta_title ?? "",
    meta_description: initial?.meta_description ?? "",
  };
}

export function PostEditorForm({
  mode,
  initial,
  categories,
  authors,
}: PostEditorFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<DraftState>(() => fromInitial(initial));
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const buildInput = (forcePublish: boolean | null) => ({
    title: draft.title,
    slug: draft.slug,
    category_id: draft.category_id || null,
    content: draft.content,
    excerpt: draft.excerpt || null,
    thumbnail: draft.thumbnail,
    og_image: draft.og_image,
    tags: draft.tags,
    author_id: draft.author_id || null,
    is_published:
      forcePublish === null ? draft.is_published : forcePublish,
    published_at: draft.published_at || null,
    meta_title: draft.meta_title || null,
    meta_description: draft.meta_description || null,
  });

  const submit = async (
    mode_: "draft" | "publish",
    overridePublish: boolean | null
  ) => {
    if (!draft.title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }
    setSubmitting(mode_);
    const input = buildInput(overridePublish);
    const result =
      mode === "create"
        ? await createPost(input)
        : await updatePost(initial!.id, input);
    setSubmitting(null);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode_ === "draft" ? "임시저장되었습니다" : "저장되었습니다"
    );
    router.push("/admin/contents?tab=posts");
  };

  const categoryOptions = [
    { label: "카테고리 선택", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const authorOptions = [
    { label: "작성자 선택", value: "" },
    ...authors.map((a) => ({ label: a.name, value: a.id })),
  ];

  return (
    <section className="space-y-6">
      {/* 상단 바 */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-primary">
            {mode === "create" ? "새 글 작성" : "게시글 수정"}
          </h1>
          <p className="mt-1 text-caption text-text-sub">
            법률정보 콘텐츠를 작성·편집합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => submit("draft", false)}
            loading={submitting === "draft"}
            disabled={submitting !== null}
          >
            <FileEdit className="mr-1.5 h-4 w-4" aria-hidden />
            임시저장
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => submit("publish", null)}
            loading={submitting === "publish"}
            disabled={submitting !== null}
          >
            <Save className="mr-1.5 h-4 w-4" aria-hidden />
            저장
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {/* 좌측 — 본문 */}
        <div className="space-y-5">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full border-0 bg-transparent px-0 py-2 text-h2 font-bold text-primary placeholder:text-text-sub/60 focus:outline-none focus:ring-0"
          />

          <Select
            label="카테고리"
            value={draft.category_id}
            onChange={(v) => update("category_id", v)}
            options={categoryOptions}
          />

          <TagInput
            tags={draft.tags}
            onChange={(next) => update("tags", next)}
          />

          <Textarea
            label="요약 (공개 페이지 카드용)"
            value={draft.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            placeholder="목록/카드에 노출될 짧은 요약"
            maxLength={300}
            rows={2}
          />

          <div>
            <label className="mb-1.5 block text-caption font-medium text-text-main">
              본문
            </label>
            <TiptapEditor
              value={draft.content}
              onChange={(html) => update("content", html)}
              placeholder="내용을 입력하세요. 이미지는 툴바 아이콘으로 업로드할 수 있습니다."
              bucket="posts"
            />
          </div>
        </div>

        {/* 우측 — 사이드바 */}
        <aside className="space-y-4">
          <Card padding="md" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Publish
            </h3>
            <label className="flex cursor-pointer items-center justify-between gap-2">
              <span className="text-caption font-medium text-text-main">
                공개 상태
              </span>
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="published-at"
                className="text-caption font-medium text-text-main"
              >
                발행일
              </label>
              <input
                id="published-at"
                type="date"
                value={draft.published_at}
                onChange={(e) => update("published_at", e.target.value)}
                className="h-10 w-full rounded-none border border-bg-light bg-bg-white px-3 text-caption text-text-main focus:border-accent focus:outline-none focus:ring-0"
              />
            </div>
            <Select
              label="작성자"
              value={draft.author_id}
              onChange={(v) => update("author_id", v)}
              options={authorOptions}
            />
            <SlugInput
              value={draft.slug}
              onChange={(next) => update("slug", next)}
              source={draft.title}
              manuallyEditedInitial={mode === "edit" && !!initial?.slug}
            />
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              SEO
            </h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="meta-title"
                  className="text-caption font-medium text-text-main"
                >
                  Meta Title
                </label>
                <span className="text-caption text-text-sub">
                  {draft.meta_title.length}/60
                </span>
              </div>
              <input
                id="meta-title"
                type="text"
                value={draft.meta_title}
                onChange={(e) => update("meta_title", e.target.value)}
                maxLength={60}
                className="h-10 w-full rounded-none border border-bg-light bg-bg-white px-3 text-caption text-text-main focus:border-accent focus:outline-none focus:ring-0"
              />
            </div>
            <Textarea
              label="Meta Description"
              value={draft.meta_description}
              onChange={(e) => update("meta_description", e.target.value)}
              maxLength={160}
              rows={3}
            />
            <ImageUploader
              bucket="seo"
              pathPrefix="posts"
              label="OG 이미지"
              aspectHint="권장 1200x630 (1.91:1)"
              currentImage={draft.og_image}
              onUpload={(url) => update("og_image", url)}
            />
          </Card>

          <Card padding="md">
            <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Thumbnail
            </h3>
            <ImageUploader
              bucket="posts"
              pathPrefix="thumbnails"
              aspectHint="권장 1200x675 (16:9)"
              currentImage={draft.thumbnail}
              onUpload={(url) => update("thumbnail", url)}
            />
          </Card>
        </aside>
      </div>
    </section>
  );
}
