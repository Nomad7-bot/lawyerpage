"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

import type { PostsFilter } from "@/lib/admin/posts";
import type { PostCategory } from "@/types";

type Props = {
  initial: PostsFilter;
  categories: PostCategory[];
};

const PUBLISHED_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "공개", value: "YES" },
  { label: "비공개", value: "NO" },
] as const;

export function PostsFilter({ initial, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [categoryId, setCategoryId] = useState<string>(
    initial.categoryId ?? "ALL"
  );
  const [published, setPublished] = useState<string>(initial.published ?? "ALL");
  const [q, setQ] = useState<string>(initial.q ?? "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sp = new URLSearchParams();
    sp.set("tab", "posts");
    if (categoryId !== "ALL") sp.set("categoryId", categoryId);
    if (published !== "ALL") sp.set("published", published);
    if (q.trim()) sp.set("q", q.trim());
    router.push(`${pathname}?${sp.toString()}`);
  };

  const handleReset = () => {
    setCategoryId("ALL");
    setPublished("ALL");
    setQ("");
    router.push(`${pathname}?tab=posts`);
  };

  const categoryOptions = [
    { label: "전체", value: "ALL" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-bg-light bg-bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="카테고리"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
        />
        <Select
          label="상태"
          value={published}
          onChange={setPublished}
          options={PUBLISHED_OPTIONS}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="post-q"
            className="text-caption font-medium text-text-main"
          >
            검색
          </label>
          <input
            id="post-q"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목 키워드"
            className="h-12 w-full rounded-none border border-bg-light bg-bg-white px-4 py-3 text-body text-text-main placeholder:text-text-sub focus:border-accent focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-caption font-bold text-text-sub transition-colors hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          초기화
        </button>
        <Button type="submit" variant="primary" size="md">
          <Search className="mr-2 h-4 w-4" aria-hidden />
          검색
        </Button>
      </div>
    </form>
  );
}
