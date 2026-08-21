import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerLandingPage } from "@/components/partners/PartnerLandingPage";
import { fetchPartnerBySlug, fetchPartners } from "@/lib/cms/public";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;
export const revalidate = 30;

export async function generateStaticParams() {
  const partners = await fetchPartners();
  return partners
    .map((partner) => partner.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partner = await fetchPartnerBySlug(slug);
  if (!partner) return {};
  return {
    title: `${partner.name} Partner | Synergy Computers`,
    description:
      partner.shortDescription ||
      `Synergy Computers partners with ${partner.name} to deliver enterprise IT solutions in Pakistan.`,
  };
}

export default async function PartnerDetailPage({ params }: Props) {
  const { slug } = await params;
  const partner = await fetchPartnerBySlug(slug);
  if (!partner) notFound();

  return <PartnerLandingPage partner={partner} />;
}
