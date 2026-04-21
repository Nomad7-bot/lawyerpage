"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AvailabilityGrid } from "@/components/admin/contents/AvailabilityGrid";
import { CareerListEditor } from "@/components/admin/contents/CareerListEditor";
import { SlugInput } from "@/components/admin/contents/SlugInput";
import { useToast } from "@/components/admin/ToastProvider";

import {
  createAttorney,
  updateAttorney,
} from "@/lib/admin/attorneys.actions";

import type { AttorneyFull, CareerItem } from "@/types";

type Props = {
  mode: "create" | "edit";
  initial: AttorneyFull | null;
  practiceAreas: { id: string; name: string }[];
};

type DraftState = {
  name: string;
  slug: string;
  position: string;
  profile_image: string | null;
  bio: string;
  career: CareerItem[];
  is_active: boolean;
  practice_area_ids: string[];
  availability: Array<{ day_of_week: number; start_time: string }>;
};

function fromInitial(initial: AttorneyFull | null): DraftState {
  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    position: initial?.position ?? "",
    profile_image: initial?.profile_image ?? null,
    bio: initial?.bio ?? "",
    career: initial?.career ?? [],
    is_active: initial?.is_active ?? true,
    practice_area_ids: initial?.practice_area_ids ?? [],
    availability: (initial?.available_slots ?? [])
      .filter((s) => s.is_active)
      .map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time.slice(0, 5),
      })),
  };
}

export function AttorneyEditorForm({ mode, initial, practiceAreas }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<DraftState>(() => fromInitial(initial));
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const togglePracticeArea = (id: string, checked: boolean) => {
    update(
      "practice_area_ids",
      checked
        ? [...draft.practice_area_ids, id]
        : draft.practice_area_ids.filter((p) => p !== id)
    );
  };

  const submit = async () => {
    if (!draft.name.trim()) {
      toast.error("이름을 입력해주세요");
      return;
    }
    setSubmitting(true);
    const input = {
      name: draft.name,
      slug: draft.slug,
      position: draft.position || null,
      profile_image: draft.profile_image,
      bio: draft.bio || null,
      career: draft.career.filter((c) => c.year.trim() || c.content.trim()),
      is_active: draft.is_active,
      practice_area_ids: draft.practice_area_ids,
      available_slots: draft.availability,
    };
    const result =
      mode === "create"
        ? await createAttorney(input)
        : await updateAttorney(initial!.id, input);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      mode === "create"
        ? "변호사가 등록되었습니다"
        : "변호사 정보가 수정되었습니다"
    );
    router.push("/admin/contents?tab=attorneys");
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-primary">
            {mode === "create" ? "변호사 추가" : "변호사 정보 수정"}
          </h1>
          <p className="mt-1 text-caption text-text-sub">
            프로필 · 전문분야 · 경력 · 상담 가능 시간을 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.push("/admin/contents?tab=attorneys")}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* 좌 — 기본 정보 */}
        <Card padding="lg" className="space-y-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Profile
          </h3>
          <div className="flex justify-center">
            <ImageUploader
              bucket="attorneys"
              pathPrefix="profiles"
              currentImage={draft.profile_image}
              onUpload={(url) => update("profile_image", url)}
              aspectHint="정사각 권장"
              circular
            />
          </div>
          <Input
            label="이름"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="홍길동"
            required
          />
          <Input
            label="직책"
            value={draft.position}
            onChange={(e) => update("position", e.target.value)}
            placeholder="파트너 변호사"
          />
          <SlugInput
            value={draft.slug}
            onChange={(next) => update("slug", next)}
            source={draft.name}
            manuallyEditedInitial={mode === "edit" && !!initial?.slug}
          />
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <span className="text-caption font-medium text-text-main">
              활성 (목록/공개 페이지 노출)
            </span>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
          </label>
        </Card>

        {/* 우 — 전문분야/소개/경력 */}
        <div className="space-y-6">
          <Card padding="lg" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Practice Areas
            </h3>
            {practiceAreas.length === 0 ? (
              <p className="text-caption text-text-sub">
                먼저 업무분야 탭에서 항목을 등록해주세요.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {practiceAreas.map((pa) => {
                  const checked = draft.practice_area_ids.includes(pa.id);
                  return (
                    <label
                      key={pa.id}
                      className="flex cursor-pointer items-center gap-2 rounded-card border border-bg-light bg-bg-white px-3 py-2 hover:border-accent/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          togglePracticeArea(pa.id, e.target.checked)
                        }
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                      <span className="text-caption text-text-main">
                        {pa.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </Card>

          <Card padding="lg">
            <Textarea
              label="소개문"
              value={draft.bio}
              onChange={(e) => update("bio", e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="변호사 소개를 간결하게 입력하세요"
            />
          </Card>

          <Card padding="lg">
            <CareerListEditor
              items={draft.career}
              onChange={(next) => update("career", next)}
            />
          </Card>

          <Card padding="lg">
            <AvailabilityGrid
              value={draft.availability}
              onChange={(next) => update("availability", next)}
            />
          </Card>
        </div>
      </div>
    </section>
  );
}
