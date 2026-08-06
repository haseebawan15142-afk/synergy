import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { MotionCard } from "@/components/motion/MotionCard";
import { fetchServices } from "@/lib/cms/public";

export const metadata: Metadata = {
  title: "Services",
  description: "Enterprise IT services — infrastructure, cloud, backup, on-site support, managed IT.",
};

/** Pick up admin CMS service changes without a full redeploy. */
export const revalidate = 30;

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <>
      <PageHeader
        title="Services"
        description="Full-lifecycle support from infrastructure and data protection to cloud and managed operations."
      />
      <ul className="page-container section-y-tight grid gap-5 sm:grid-cols-2 sm:gap-6">
        {services.map((s) => (
          <li key={s.slug}>
            <MotionCard className="h-full">
              <Link
                href={`/services/${s.slug}`}
                className="block rounded-lg border border-border bg-surface-elevated p-6 hover:border-synergy"
              >
                <h2 className="text-xl font-semibold text-ink">{s.title}</h2>
                <p className="mt-2 text-ink-body">{s.summary}</p>
              </Link>
            </MotionCard>
          </li>
        ))}
      </ul>
    </>
  );
}
