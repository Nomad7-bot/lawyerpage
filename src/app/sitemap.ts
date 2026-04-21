import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";
import {
  PRACTICE_AREAS,
  ATTORNEYS,
  INSIGHTS,
} from "@/constants/dummy";

/**
 * sitemap.xml — Next.js 15 내장 규약.
 * 정적 URL + DB 동적 URL(practice_areas/attorneys/posts) 합성.
 * DB 실패 시 더미 slug 로 fallback 하여 빌드 중단 방지.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/practice-areas"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/attorneys"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/insights"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/reservation"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const [practiceAreaEntries, attorneyEntries, postEntries] = await Promise.all([
    getPracticeAreaEntries(now),
    getAttorneyEntries(now),
    getPostEntries(now),
  ]);

  return [
    ...staticEntries,
    ...practiceAreaEntries,
    ...attorneyEntries,
    ...postEntries,
  ];
}

// ─────────────────────────────────────────────

type Entry = MetadataRoute.Sitemap[number];

async function getPracticeAreaEntries(now: Date): Promise<Entry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("practice_areas")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return fallbackPracticeAreas(now);
    }
    return data.map((row) => ({
      url: absoluteUrl(`/practice-areas/${row.slug}`),
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    return fallbackPracticeAreas(now);
  }
}

function fallbackPracticeAreas(now: Date): Entry[] {
  return PRACTICE_AREAS.map((a) => ({
    url: absoluteUrl(`/practice-areas/${a.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

async function getAttorneyEntries(now: Date): Promise<Entry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attorneys")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return fallbackAttorneys(now);
    }
    return data.map((row) => ({
      url: absoluteUrl(`/attorneys/${row.slug}`),
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    return fallbackAttorneys(now);
  }
}

function fallbackAttorneys(now: Date): Entry[] {
  return ATTORNEYS.map((a) => ({
    url: absoluteUrl(`/attorneys/${a.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

async function getPostEntries(now: Date): Promise<Entry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("slug, updated_at, published_at")
      .eq("is_published", true);

    if (error || !data || data.length === 0) {
      return fallbackPosts(now);
    }
    return data.map((row) => ({
      url: absoluteUrl(`/insights/${row.slug}`),
      lastModified: row.updated_at
        ? new Date(row.updated_at)
        : row.published_at
          ? new Date(row.published_at)
          : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    return fallbackPosts(now);
  }
}

function fallbackPosts(now: Date): Entry[] {
  return INSIGHTS.map((i) => ({
    url: absoluteUrl(`/insights/${i.slug}`),
    lastModified: i.publishedAt ? new Date(i.publishedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
