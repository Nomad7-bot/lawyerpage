import type { Metadata } from "next";
import { AboutHeroBanner } from "@/components/sections/AboutHeroBanner";
import { AboutVisionSection } from "@/components/sections/AboutVisionSection";
import { AboutStatsSection } from "@/components/sections/AboutStatsSection";
import { AboutHistoryTimeline } from "@/components/sections/AboutHistoryTimeline";
import { AboutCTASection } from "@/components/sections/AboutCTASection";
import { buildMetadata } from "@/lib/seo/buildMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "about",
    path: "/about",
    fallback: {
      title: "사무소 소개",
      description:
        "신뢰와 전문성으로 30년, 법률사무소의 비전과 연혁을 소개합니다. 5명의 전문 변호사가 의뢰인의 권리를 지켜드립니다.",
    },
  });
}

export default function AboutPage() {
  return (
    <main>
      <AboutHeroBanner />
      <AboutVisionSection />
      <AboutStatsSection />
      <AboutHistoryTimeline />
      <AboutCTASection />
    </main>
  );
}
