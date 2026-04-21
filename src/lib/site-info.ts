import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/constants/site";

import type { SiteSettings } from "@/types";

/**
 * 공개 페이지에서 사용하는 NAP/영업시간 통합 정보.
 *
 * - site_settings (DB) 를 우선 사용
 * - 누락/실패 시 `SITE` 상수(constants/site.ts) 로 fallback
 *   → 렌더 실패를 막고 프로덕션에서도 항상 값이 노출되도록 보장
 */
export type ResolvedSiteInfo = {
  name: string;
  description: string;
  address: string;
  phone: string;
  phoneDisplay: string;
  fax: string;
  email: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
  blogUrl: string | null;
  instagramUrl: string | null;
};

function fromSettings(
  row: SiteSettings | null,
  description: string
): ResolvedSiteInfo {
  const bh = row?.business_hours;
  return {
    name: row?.firm_name ?? SITE.name,
    description,
    address: row?.address ?? SITE.nap.address,
    phone: row?.phone ?? SITE.nap.phone,
    phoneDisplay: row?.phone ?? SITE.nap.phoneDisplay,
    fax: row?.fax ?? SITE.nap.fax,
    email: row?.email ?? SITE.nap.email,
    hoursWeekday: bh?.weekday ?? SITE.businessHours.weekday,
    hoursSaturday: bh?.saturday ?? SITE.businessHours.saturday,
    hoursSunday: bh?.sunday ?? SITE.businessHours.sunday,
    blogUrl: row?.blog_url ?? null,
    instagramUrl: row?.instagram_url ?? null,
  };
}

export async function getResolvedSiteInfo(): Promise<ResolvedSiteInfo> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[site-info] site_settings 조회 실패 — 상수 fallback", error);
    return fromSettings(null, SITE.description);
  }
  return fromSettings(
    (data as SiteSettings | null) ?? null,
    data?.default_description ?? SITE.description
  );
}
