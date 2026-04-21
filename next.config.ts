import path from "node:path";
import type { NextConfig } from "next";

/**
 * Next.js 설정 — Phase 4 STEP 3 Core Web Vitals 최적화 + QA 조정.
 * - outputFileTracingRoot: worktree 상위에 package-lock.json 이 있을 때 lockfile 중복 경고 억제
 * - images.remotePatterns: Supabase Storage 공개 URL 대비 (실제 이미지 연동 전이라도 미리 허용)
 * - headers(): 정적 자산 1년 immutable, 이미지 30일, HTML no-cache
 * - bundle-analyzer: ANALYZE=true npm run build 로 번들 리포트 생성
 */

type BundleAnalyzer = (config: NextConfig) => NextConfig;

let withBundleAnalyzer: BundleAnalyzer = (config) => config;
if (process.env.ANALYZE === "true") {
  // ANALYZE=true 일 때만 dynamic require — 평상시 빌드에는 영향 없음
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: true });
}

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  // 현재 worktree 를 트레이싱 루트로 고정 — 상위 package-lock.json 과 충돌 경고 방지
  outputFileTracingRoot: path.resolve(__dirname),

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(SUPABASE_HOST
        ? [
            {
              protocol: "https" as const,
              hostname: SUPABASE_HOST,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },

  async headers() {
    return [
      // 정적 자산 (_next/static) — 1년 immutable (Next.js 가 기본 처리하지만 명시)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Next.js 이미지 최적화 캐시
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, s-maxage=31536000" },
        ],
      },
      // public/ 의 정적 이미지 (로고 등)
      {
        source: "/:path*\\.(jpg|jpeg|png|webp|avif|svg|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=604800" },
        ],
      },
      // 폰트
      {
        source: "/:path*\\.(woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
