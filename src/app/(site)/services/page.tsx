import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchServices } from "@/lib/cms/public-server";
import { problemCards } from "@/lib/content/problems";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Enterprise IT services — field support, intelligent infrastructure, data resilience, and always-on operations.",
};

/** Pick up admin CMS service changes without a full redeploy. */
export const revalidate = 30;

export default async function ServicesPage() {
  const services = await fetchServices();
  const badgeBySlug = Object.fromEntries(problemCards.map((p) => [p.serviceSlug, p.label]));

  return (
    <>
      <PageHeader
        title="Services"
        description="Full-lifecycle support from infrastructure and data protection to managed operations."
      />
      <ul className="page-container section-y-tight grid gap-6 sm:grid-cols-2 lg:gap-7 xl:grid-cols-3">
        {services.map((s) => {
          const badge = badgeBySlug[s.slug] || s.title;
          return (
            <li key={s.slug} className="flex">
              <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-soft transition hover:border-slate-700 hover:shadow-card">
                {s.image ? (
                  <Link
                    href={`/services/${s.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden"
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                      aria-hidden
                    />
                    <span className="absolute left-4 top-4 rounded-md bg-surface-elevated/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-synergy shadow-sm">
                      {badge}
                    </span>
                  </Link>
                ) : null}
                <div className="flex flex-1 flex-col bg-slate-950 p-5 sm:p-6">
                  <h2 className="text-base font-semibold text-white sm:text-lg">
                    <Link href={`/services/${s.slug}`} className="transition hover:text-synergy-light">
                      {s.title}
                    </Link>
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{s.summary}</p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-5 inline-flex min-h-10 items-center text-sm font-medium text-synergy-light transition hover:text-white"
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
