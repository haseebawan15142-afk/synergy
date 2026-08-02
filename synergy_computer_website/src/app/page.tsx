import { CtaBand, IndustriesGrid } from "@/components/home/IndustriesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { PartnersTeaser } from "@/components/home/PartnersTeaser";
import { ProblemsSection } from "@/components/home/ProblemsSection";
import { RecentUpdatesSection } from "@/components/home/RecentUpdatesSection";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { StorySection } from "@/components/home/StorySection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PartnersStrip />
      <StorySection />
      <ProblemsSection />
      <ServicesGrid />
      <RecentUpdatesSection />
      <PartnersTeaser />
      <IndustriesGrid />
      <CtaBand />
    </>
  );
}
