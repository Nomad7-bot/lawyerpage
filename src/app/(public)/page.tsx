import { HeroSection } from "@/components/sections/HeroSection";
import { PracticeAreaSection } from "@/components/sections/PracticeAreaSection";
import { AttorneySection } from "@/components/sections/AttorneySection";
import { InsightSection } from "@/components/sections/InsightSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FloatingCTA } from "@/components/sections/FloatingCTA";

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
