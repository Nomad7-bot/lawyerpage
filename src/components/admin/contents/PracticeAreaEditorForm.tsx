"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconPicker } from "@/components/admin/contents/IconPicker";
import { SlugInput } from "@/components/admin/contents/SlugInput";
import { TiptapEditor } from "@/components/admin/contents/TiptapEditor";
import { useToast } from "@/components/admin/ToastProvider";

import {
  createPracticeArea,
  updatePracticeArea,
} from "@/lib/admin/practice-areas.actions";

import type { PracticeAreaFull } from "@/types";

type Props = {
  mode: "create" | "edit";
  initial: PracticeAreaFull | null;
};

type DraftState = {
  name: string;
  slug: string;
  description: string;
  detail_content: string;
  icon_name: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
};

function fromInitial(initial: PracticeAreaFull | null): DraftState {
  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    detail_content: initial?.detail_content ?? "",
    icon_name: initial?.icon_name ?? "",
    is_active: initial?.is_active ?? true,
    meta_title: initial?.meta_title ?? "",
    meta_description: initial?.meta_description ?? "",
  };
}

export function PracticeAreaEditorForm({ mode, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<DraftState>(() => fromInitial(initial));
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!draft.name.trim()) {
      toast.error("분야명을 입력해주세요");
      return;
    }
    setSubmitting(true);
    const input = {
      name: draft.name,
      slug: draft.slug,
      description: draft.description || null,
      detail_content: draft.detail_content || null,
      icon_name: draft.icon_name || null,
      is_active: draft.is_active,
      meta_title: draft.meta_title || null,
      meta_description: draft.meta_description || null,
    };
    const result =
      mode === "create"
        ? await createPracticeArea(input)
        : await updatePracticeArea(initial!.id, input);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      mode === "create" ? "업무분야가 등록되었습니다" : "저장되었습니다"
    );
    router.push("/admin/contents?tab=practice-areas");
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-primary">
            {mode === "create" ? "업무분야 추가" : "업무분야 수정"}
          </h1>
          <p className="mt-1 text-caption text-text-sub">
            공개 페이지 노출 항목과 SEO 메타를 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() =>
              router.push("/admin/contents?tab=practice-areas")
            }
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={submit}
            loading={submitting}
          >
            <Save className="mr-1.5 h-4 w-4" aria-hidden />
            저장
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {/* 좌 — 본문 */}
        <div className="space-y-5">
          <Card padding="lg" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="분야명"
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="예: 형사사건"
                required
              />
              <SlugInput
                value={draft.slug}
                onChange={(next) => update("slug", next)}
                source={draft.name}
                manuallyEditedInitial={mode === "edit" && !!initial?.slug}
              />
            </div>
            <IconPicker
              value={draft.icon_name}
              onChange={(next) => update("icon_name", next)}
            />
            <Textarea
              label="간략 설명 (카드용)"
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="목록 카드에 노출될 짧은 설명"
              maxLength={300}
              rows={3}
            />
          </Card>

          <Card padding="lg" className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Detail
            </h3>
            <TiptapEditor
              value={draft.detail_content}
              onChange={(html) => update("detail_content", html)}
              placeholder="업무분야 상세 본문을 입력하세요"
              bucket="posts"
            />
          </Card>
        </div>

        {/* 우 — 사이드바 */}
        <aside className="space-y-4">
          <Card padding="md" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Visibility
            </h3>
            <label className="flex cursor-pointer items-center justify-between gap-2">
              <span className="text-caption font-medium text-text-main">
                활성 (공개 페이지 노출)
              </span>
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
            </label>
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              SEO
            </h3>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="pa-meta-title"
                  className="text-caption font-medium text-text-main"
                >
                  Meta Title
                </label>
                <span className="text-caption text-text-sub">
                  {draft.meta_title.length}/60
                </span>
              </div>
              <input
                id="pa-meta-title"
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
          </Card>
        </aside>
      </div>
    </section>
  );
}
