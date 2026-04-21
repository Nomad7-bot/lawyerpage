import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { PracticeAreaSection } from "@/components/sections/PracticeAreaSection";
import { AttorneySection } from "@/components/sections/AttorneySection";
import { InsightSection } from "@/components/sections/InsightSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FloatingCTA } from "@/components/sections/FloatingCTA";
import { buildMetadata } from "@/lib/seo/buildMetadata";
import { SITE } from "@/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageName: "home",
    path: "/",
    fallback: {
      title: SITE.name,
      description: SITE.description,
    },
  });
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PracticeAreaSection />
      <AttorneySection />
      <InsightSection />
      <ContactSection />
      <FloatingCTA />
    </>
  );
}
