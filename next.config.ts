import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 공개 버킷 URL 패턴을 허용한다.
    // (variants 컬럼: attorneys.profile_image / posts.thumbnail / posts.og_image / site_settings.default_og_image)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pusbjkwmzeaeftehozmh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
