import { ClientSuccess } from "@/components/home/ClientSuccess";
import { ClienteleMarquee } from "@/components/home/ClienteleMarquee";
import { PartnershipsMarquee } from "@/components/home/PartnershipsMarquee";
import { SolutionsGrid } from "@/components/home/SolutionsGrid";
import { CtaBand, IndustriesGrid } from "@/components/home/IndustriesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnersTeaser } from "@/components/home/PartnersTeaser";
import { ProblemsSection } from "@/components/home/ProblemsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { RecentUpdatesSection } from "@/components/home/RecentUpdatesSection";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { StorySection } from "@/components/home/StorySection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ClienteleMarquee />
      <StorySection />
      <ProblemsSection />
      <SolutionsGrid />
      <ServicesGrid />
      <PartnershipsMarquee />
      <ClientSuccess />
      <NewsletterSection />
      <RecentUpdatesSection />
      <PartnersTeaser />
      <IndustriesGrid />
      <CtaBand />
    </>
  );
}
