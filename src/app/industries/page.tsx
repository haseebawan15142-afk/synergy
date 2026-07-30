import type { Metadata } from "next";

import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";

import { MotionCard } from "@/components/motion/MotionCard";

import { industries } from "@/lib/content/industries";



export const metadata: Metadata = {

  title: "Industries",

  description: "Industry-focused IT solutions across Pakistan.",

};



export default function IndustriesPage() {

  return (

    <>

      <PageHeader

        title="Industries"

        description="We support organizations whose operations depend on secure, available technology."

      />

      <ul className="page-container section-y-tight grid gap-5 sm:grid-cols-2 sm:gap-6">

        {industries.map((ind) => (

          <li key={ind.slug}>

            <MotionCard className="h-full">

              <Link

                href={`/industries/${ind.slug}`}

                className="block rounded-lg border border-border bg-surface-elevated p-6 hover:border-synergy"

              >

                <h2 className="text-xl font-semibold text-ink">{ind.title}</h2>

                <p className="mt-2 text-ink-body">{ind.summary}</p>

              </Link>

            </MotionCard>

          </li>

        ))}

      </ul>

    </>

  );

}

