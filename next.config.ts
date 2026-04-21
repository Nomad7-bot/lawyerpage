import type { NextConfig } from "next";

/**
 * Supabase Storage 호스트 허용
 *
 * NEXT_PUBLIC_SUPABASE_URL 에서 hostname 만 추출해 remotePatterns 에 등록.
 * 예: https://abcde.supabase.co → abcde.supabase.co
 *
 * pathname 은 Supabase public storage 경로로 제한해 다른 경로(Auth 콜백 등)
 * 가 실수로 Image 최적화에 포함되지 않도록 차단.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
