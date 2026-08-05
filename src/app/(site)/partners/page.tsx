import type { Metadata } from "next";
import { DynatracePartnerSection } from "@/components/partners/DynatracePartnerSection";
import { PartnerCardGrid } from "@/components/partners/PartnerCardGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchPartners } from "@/lib/cms/public";

export const metadata: Metadata = {
  title: "Partners",
  description: "Technology principals and strategic alliances — Synergy Computers Pakistan.",
};

export default async function PartnersPage() {
  const partners = await fetchPartners();

  return (
    <>
      <PageHeader
        title="Our principals"
        description="Strategic alliances with global technology leaders."
      />
      <DynatracePartnerSection />
      <PartnerCardGrid partners={partners} />
    </>
  );
}
