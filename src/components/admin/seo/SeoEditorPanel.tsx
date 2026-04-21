"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SeoPreviews } from "@/components/admin/seo/SeoPreviews";
import { useToast } from "@/components/admin/ToastProvider";

import { updateSeoSetting } from "@/lib/admin/seo.actions";
import { pageLabel } from "@/lib/admin/seo-meta";

import type { SeoSetting } from "@/types";

type Props = {
  siteUrl: string;
  target: SeoSetting | null;
  onClose: () => void;
};

type Draft = {
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string | null;
  canonical_url: string;
};

function fromInitial(s: SeoSetting | null, siteUrl: string): Draft {
  return {
    meta_title: s?.meta_title ?? "",
    meta_description: s?.meta_description ?? "",
    og_title: s?.og_title ?? "",
    og_description: s?.og_description ?? "",
    og_image: s?.og_image ?? null,
    canonical_url:
      s?.canonical_url ?? (s ? `${siteUrl.replace(/\/$/, "")}${s.page_url}` : ""),
  };
}

export function SeoEditorPanel({ siteUrl, target, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => fromInitial(target, siteUrl));
  const [submitting, setSubmitting] = useState(false);

  // target 변경 시 상태 초기화
  useEffect(() => {
    setDraft(fromInitial(target, siteUrl));
  }, [target, siteUrl]);

  if (!target) return null;

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSubmitting(true);
    const result = await updateSeoSetting(target.id, {
      meta_title: draft.meta_title || null,
      meta_description: draft.meta_description || null,
      og_title: draft.og_title || null,
      og_description: draft.og_description || null,
      og_image: draft.og_image,
      canonical_url: draft.canonical_url || null,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("SEO 설정이 저장되었습니다");
    router.refresh();
    onClose();
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={onClose}
        disabled={submitting}
      >
        취소
      </Button>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={handleSave}
        loading={submitting}
      >
        <Save className="mr-1.5 h-4 w-4" aria-hidden />
        저장
      </Button>
    </>
  );

  return (
    <DrawerPanel
      isOpen={target !== null}
      onClose={submitting ? () => undefined : onClose}
      title={pageLabel(target.page_name)}
      subtitle={target.page_url}
      footer={footer}
      width={480}
    >
      <div className="space-y-6">
        {/* Meta */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="meta-title"
                className="text-caption font-medium text-text-main"
              >
                Meta Title
              </label>
              <span className="text-caption text-text-sub">
                {draft.meta_title.length}/60 · 권장 50~60자
              </span>
            </div>
            <input
              id="meta-title"
              type="text"
              value={draft.meta_title}
              onChange={(e) => update("meta_title", e.target.value)}
              maxLength={60}
              className="h-11 w-full rounded-none border border-bg-light bg-bg-white px-3 text-body text-text-main focus:border-accent focus:outline-none focus:ring-0"
            />
          </div>
          <Textarea
            label="Meta Description"
            value={draft.meta_description}
            onChange={(e) => update("meta_description", e.target.value)}
            maxLength={160}
            rows={3}
            helperText="검색결과 하단 설명에 사용됩니다"
          />
        </section>

        {/* OG */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Open Graph
          </h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="og-title"
                className="text-caption font-medium text-text-main"
              >
                OG Title
              </label>
              <span className="text-caption text-text-sub">
                {draft.og_title.length}/60
              </span>
            </div>
            <input
              id="og-title"
              type="text"
              value={draft.og_title}
              onChange={(e) => update("og_title", e.target.value)}
              maxLength={60}
              placeholder="비워두면 Meta Title 사용"
              className="h-11 w-full rounded-none border border-bg-light bg-bg-white px-3 text-body text-text-main placeholder:text-text-sub focus:border-accent focus:outline-none focus:ring-0"
            />
          </div>
          <Textarea
            label="OG Description"
            value={draft.og_description}
            onChange={(e) => update("og_description", e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="비워두면 Meta Description 사용"
          />
          <ImageUploader
            bucket="seo"
            pathPrefix={`pages/${target.page_name}`}
            label="OG Image"
            aspectHint="권장 1200×630 (1.91:1)"
            currentImage={draft.og_image}
            onUpload={(url) => update("og_image", url)}
          />
        </section>

        {/* Canonical */}
        <section>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="canonical-url"
              className="text-caption font-medium text-text-main"
            >
              Canonical URL
            </label>
            <input
              id="canonical-url"
              type="url"
              value={draft.canonical_url}
              onChange={(e) => update("canonical_url", e.target.value)}
              className="h-11 w-full rounded-none border border-bg-light bg-bg-white px-3 font-mono text-caption text-text-main focus:border-accent focus:outline-none focus:ring-0"
            />
            <p className="text-caption text-text-sub">
              자동 생성됩니다. 필요 시 수정 가능 — 중복 콘텐츠 방지용 권장 URL.
            </p>
          </div>
        </section>

        {/* 실시간 미리보기 */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Live Preview
          </h3>
          <SeoPreviews
            siteUrl={siteUrl}
            pageUrl={target.page_url}
            metaTitle={draft.meta_title}
            metaDescription={draft.meta_description}
            ogTitle={draft.og_title}
            ogDescription={draft.og_description}
            ogImage={draft.og_image}
          />
        </section>
      </div>
    </DrawerPanel>
  );
}
