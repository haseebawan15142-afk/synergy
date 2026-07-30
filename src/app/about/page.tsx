import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About",
  description: "About Synergy Computers (Pvt.) Ltd — 40+ years of enterprise IT in Pakistan.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Driving excellence through technology"
        description="Synergy Computers (Pvt.) Ltd — Pakistan's premium IT solutions provider since the early days of the country's IT industry."
      />
      <div className="prose prose-neutral page-container max-w-3xl section-y-tight !py-12">
        <p>
          With more than 40 years of experience, we serve clients in banking and finance, power
          generation, healthcare, education, hospitality, utilities, and multinational corporations
          — from hardware and enterprise applications to integration and 24×7 support.
        </p>
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
    </>
  );
}
