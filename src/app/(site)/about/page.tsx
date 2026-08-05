import type { Metadata } from "next";
import { CeoMessageSection } from "@/components/about/CeoMessageSection";
import { LeadershipSection } from "@/components/about/LeadershipSection";
import { BoardOfDirectorsSection } from "@/components/about/BoardOfDirectorsSection";
import { ExpertiseSection } from "@/components/about/ExpertiseSection";
import { AccomplishmentsSection } from "@/components/about/AccomplishmentsSection";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  aboutUsFromProfile,
  companyProfileMeta,
  whySynergyFromProfile,
} from "@/lib/content/company-profile";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Synergy Computers (Pvt.) Ltd — trusted technology partner in Pakistan since 1981.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
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
        {/*
          TODO: Vision / Mission blocks below are retained from the existing site.
          They are not printed as Mission/Vision in Company Profile 2026 — confirm
          with marketing before treating them as profile-sourced.
        */}
        <h2>Vision</h2>
        <p>
          To develop and enhance the IT industry of Pakistan through innovative digital and software
          solutions, and to build trustworthy customer relationships with reliable services.
        </p>
        <h2>Mission</h2>
        <p>
          To help organizations secure and use their data to boost revenue, increase efficiency, and
          deliver world-class services while building long-term industry partnerships.
        </p>
      </div>
      <ExpertiseSection />
      <BoardOfDirectorsSection />
      <CeoMessageSection />
      <LeadershipSection />
      <AccomplishmentsSection />
    </>
  );
}
