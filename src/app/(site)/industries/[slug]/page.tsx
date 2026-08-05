import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { industries } from "@/lib/content/industries";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return {};
  return { title: industry.title, description: industry.summary };
}

export default async function IndustryDetailPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();

  return (
    <>
      <PageHeader title={industry.title} description={industry.summary} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-ink-body">
          Synergy Computers delivers infrastructure, applications, security, and managed services
          tailored to {industry.title.toLowerCase()} requirements. Contact us to discuss your
          environment and goals.
        </p>
        <Button href="/contact" className="mt-8">
          Contact us
        </Button>
        <Link
          href="/industries"
          className="ml-4 text-sm font-semibold text-synergy hover:text-synergy-dark"
        >
          ← All industries
        </Link>
      </div>
    </>
  );
}
