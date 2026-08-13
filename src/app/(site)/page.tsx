import type { Metadata } from "next";
import { ClientSuccess } from "@/components/home/ClientSuccess";
import { ClienteleMarquee } from "@/components/home/ClienteleMarquee";
import { PartnershipsMarquee } from "@/components/home/PartnershipsMarquee";
import { CtaBand, IndustriesGrid } from "@/components/home/IndustriesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { ProblemsSection } from "@/components/home/ProblemsSection";
import { RecentUpdatesSection } from "@/components/home/RecentUpdatesSection";
import { StorySection } from "@/components/home/StorySection";
import { siteConfig } from "@/lib/content/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} | IT Solutions Pakistan`,
  },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

export const revalidate = 15;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ClienteleMarquee />
      <StorySection />
      <ProblemsSection />
      <PartnershipsMarquee />
      <ClientSuccess />
      <RecentUpdatesSection />
      <IndustriesGrid />
      <CtaBand />
    </>
  );
}
