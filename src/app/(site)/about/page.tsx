import type { Metadata } from "next";
import { CeoMessageSection } from "@/components/about/CeoMessageSection";
import { BoardOfDirectorsSection } from "@/components/about/BoardOfDirectorsSection";
import { ExpertiseSection } from "@/components/about/ExpertiseSection";
import { AccomplishmentsSection } from "@/components/about/AccomplishmentsSection";
import { AboutHero } from "@/components/about/AboutHero";
import {
  aboutUsFromProfile,
  companyProfileMeta,
  whySynergyFromProfile,
} from "@/lib/content/company-profile";
import { fetchSiteSettings } from "@/lib/cms/public-server";

const DEFAULT_VISION =
  "To develop and enhance the IT industry of Pakistan through innovative digital and software solutions, and to build trustworthy customer relationships with reliable services.";

const DEFAULT_MISSION =
  "To help organizations secure and use their data to boost revenue, increase efficiency, and deliver world-class services while building long-term industry partnerships.";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Synergy Computers (Pvt.) Ltd — trusted technology partner in Pakistan since 1981.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await fetchSiteSettings();
  const vision = settings.vision?.trim() || DEFAULT_VISION;
  const mission = settings.mission?.trim() || DEFAULT_MISSION;

  return (
    <>
      <AboutHero
        title="Driving excellence through technology"
        description={`Synergy Computers (Pvt.) Ltd — ${companyProfileMeta.tagline}. Trusted technology partner in Pakistan since ${companyProfileMeta.foundedYear}.`}
      />
      <div
        id="who-we-are"
        className="prose prose-neutral page-container max-w-3xl scroll-mt-24 section-y-tight !py-12"
      >
        <p>{aboutUsFromProfile}</p>
        <h2>Why Synergy Computers</h2>
        <p>{whySynergyFromProfile}</p>
        <h2>Vision</h2>
        <p>{vision}</p>
        <h2>Mission</h2>
        <p>{mission}</p>
      </div>
      <ExpertiseSection />
      <BoardOfDirectorsSection />
      <CeoMessageSection />
      <AccomplishmentsSection />
    </>
  );
}
