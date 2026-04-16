import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { PracticeAreaSection } from "@/components/sections/PracticeAreaSection";
import { AttorneySection } from "@/components/sections/AttorneySection";
import { InsightSection } from "@/components/sections/InsightSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FloatingCTA } from "@/components/sections/FloatingCTA";
import {
  getAttorneys,
  getPosts,
  getPracticeAreas,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { SITE } from "@/constants/site";

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
  alternates: { canonical: SITE.url },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    type: "website",
  },
};

export default async function HomePage() {
  const [areas, attorneys, { posts }, settings] = await Promise.all([
    getPracticeAreas(),
    getAttorneys(),
    getPosts({ limit: 3 }),
    getSiteSettings(),
  ]);

  return (
    <>
      <HeroSection />
      <PracticeAreaSection areas={areas} />
      <AttorneySection attorneys={attorneys} />
      <InsightSection posts={posts} />
      {settings && <ContactSection settings={settings} />}
      <FloatingCTA />
    </>
  );
}
