import type { Metadata } from "next";
import { ClienteleMarquee } from "@/components/home/ClienteleMarquee";
import { PartnershipsMarquee } from "@/components/home/PartnershipsMarquee";
import { CtaBand } from "@/components/home/CtaBand";
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
      <RecentUpdatesSection />
      <CtaBand />
    </>
  );
}
