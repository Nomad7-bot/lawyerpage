import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/schema";

/**
 * robots.txt — Next.js 15 내장 규약.
 * /admin 과 /api 는 Disallow + sitemap 링크 포함.
 * admin/layout.tsx 의 noindex 메타와 이중 방어.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
