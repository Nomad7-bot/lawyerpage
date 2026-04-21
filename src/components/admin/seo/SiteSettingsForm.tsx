"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/ToastProvider";

import { updateSiteSettings } from "@/lib/admin/site-settings.actions";

import type { SiteSettings } from "@/types";

type Props = {
  initial: SiteSettings | null;
};

type Draft = {
  firm_name: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
  hours_holiday: string;
  blog_url: string;
  instagram_url: string;
  default_title_template: string;
  default_description: string;
  default_og_image: string | null;
};

function fromInitial(initial: SiteSettings | null): Draft {
  const bh = initial?.business_hours ?? {
    weekday: "",
    saturday: "",
    sunday: "",
    holiday: "",
  };
  return {
    firm_name: initial?.firm_name ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    fax: initial?.fax ?? "",
    email: initial?.email ?? "",
    hours_weekday: bh.weekday ?? "",
    hours_saturday: bh.saturday ?? "",
    hours_sunday: bh.sunday ?? "",
    hours_holiday: bh.holiday ?? "",
    blog_url: initial?.blog_url ?? "",
    instagram_url: initial?.instagram_url ?? "",
    default_title_template: initial?.default_title_template ?? "",
    default_description: initial?.default_description ?? "",
    default_og_image: initial?.default_og_image ?? null,
  };
}

export function SiteSettingsForm({ initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => fromInitial(initial));
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!draft.firm_name.trim()) {
      toast.error("사무소명을 입력해주세요");
      return;
    }
    setSubmitting(true);
    const result = await updateSiteSettings(initial?.id ?? null, {
      firm_name: draft.firm_name,
      address: draft.address,
      phone: draft.phone,
      fax: draft.fax || null,
      email: draft.email || null,
      business_hours: {
        weekday: draft.hours_weekday,
        saturday: draft.hours_saturday,
        sunday: draft.hours_sunday,
        holiday: draft.hours_holiday,
      },
      blog_url: draft.blog_url || null,
      instagram_url: draft.instagram_url || null,
      default_title_template: draft.default_title_template || null,
      default_description: draft.default_description || null,
      default_og_image: draft.default_og_image,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("사이트 정보가 저장되었습니다");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
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
      </div>

      {/* 사무소 정보 (NAP) */}
      <Card padding="lg" className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Firm Info (NAP)
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="사무소명"
            value={draft.firm_name}
            onChange={(e) => update("firm_name", e.target.value)}
            required
            maxLength={100}
          />
          <Input
            label="전화번호"
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="02-XXX-XXXX"
          />
          <Input
            label="팩스"
            value={draft.fax}
            onChange={(e) => update("fax", e.target.value)}
            placeholder="02-XXX-XXXX"
          />
          <Input
            label="이메일"
            type="email"
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="contact@example.com"
          />
        </div>
        <Textarea
          label="주소"
          value={draft.address}
          onChange={(e) => update("address", e.target.value)}
          rows={2}
          placeholder="서울특별시 ..."
        />
      </Card>

      {/* 영업시간 */}
      <Card padding="lg" className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Business Hours
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="평일 (월~금)"
            value={draft.hours_weekday}
            onChange={(e) => update("hours_weekday", e.target.value)}
            placeholder="09:00~18:00"
          />
          <Input
            label="토요일"
            value={draft.hours_saturday}
            onChange={(e) => update("hours_saturday", e.target.value)}
            placeholder="10:00~14:00"
          />
          <Input
            label="일요일"
            value={draft.hours_sunday}
            onChange={(e) => update("hours_sunday", e.target.value)}
            placeholder="휴무"
          />
          <Input
            label="공휴일"
            value={draft.hours_holiday}
            onChange={(e) => update("hours_holiday", e.target.value)}
            placeholder="휴무"
          />
        </div>
      </Card>

      {/* 기본 SEO */}
      <Card padding="lg" className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Default SEO
        </h3>
        <Input
          label="Title 템플릿"
          value={draft.default_title_template}
          onChange={(e) =>
            update("default_title_template", e.target.value)
          }
          placeholder="{page} | 법무법인 정의"
          helperText="{page} 가 개별 페이지명으로 치환됩니다"
          maxLength={100}
        />
        <Textarea
          label="기본 Description"
          value={draft.default_description}
          onChange={(e) => update("default_description", e.target.value)}
          rows={3}
          placeholder="페이지별 description 이 비었을 때 사용되는 기본값"
        />
        <ImageUploader
          bucket="seo"
          pathPrefix="default"
          label="기본 OG Image"
          aspectHint="권장 1200×630"
          currentImage={draft.default_og_image}
          onUpload={(url) => update("default_og_image", url)}
        />
      </Card>

      {/* SNS */}
      <Card padding="lg" className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          SNS Links
        </h3>
        <Input
          label="블로그 URL"
          type="url"
          value={draft.blog_url}
          onChange={(e) => update("blog_url", e.target.value)}
          placeholder="https://blog.naver.com/..."
        />
        <Input
          label="인스타그램 URL"
          type="url"
          value={draft.instagram_url}
          onChange={(e) => update("instagram_url", e.target.value)}
          placeholder="https://instagram.com/..."
        />
      </Card>
    </div>
  );
}
