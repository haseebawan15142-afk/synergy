import type { Metadata } from "next";
import { CareersHero } from "@/components/careers/CareersHero";
import { CareersStatsSection } from "@/components/careers/CareersStatsSection";
import { CareerTracksSection } from "@/components/careers/CareerTracksSection";
import { CultureSection } from "@/components/careers/CultureSection";
import { HiringProcessSection } from "@/components/careers/HiringProcessSection";
import { LocationsSection } from "@/components/careers/LocationsSection";
import { JobsAndApplication } from "@/components/careers/JobsAndApplication";
import { CareersCommunitySection } from "@/components/careers/CareersCommunitySection";
import { CareersCtaSection } from "@/components/careers/CareersCtaSection";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Synergy Computers (Pvt.) Ltd — explore open IT positions in Karachi, Lahore, Islamabad, and Gilgit, or submit a general application.",
};

export default function CareersPage() {
  return (
    <>
      <CareersHero />
      <CareersStatsSection />
      <CareerTracksSection />
      <CultureSection />
      <HiringProcessSection />
      <LocationsSection />
      <JobsAndApplication />
      <CareersCommunitySection />
      <CareersCtaSection />
    </>
  );
}
