import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/content/services";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function ServicesGrid() {
  return (
    <section className="relative overflow-hidden bg-surface section-y" aria-labelledby="services-heading">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-synergy/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="page-container relative">
        <Reveal className="flex flex-col items-stretch justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="services-heading"
            eyebrow="Our services"
            title="Capabilities built for enterprise outcomes"
            description="With deep industry experience and vendor-aligned expertise, we deliver end-to-end services — from infrastructure and security to cloud and managed operations."
            className="max-w-2xl"
          />
          <Button href="/services" variant="secondary" className="w-full shrink-0 lg:w-auto">
            View all services
          </Button>
        </Reveal>

        <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {services.map((service) => (
            <li key={service.slug} className="flex">
              <article className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-soft transition hover:border-slate-700 hover:shadow-card">
                <Link href={`/services/${service.slug}`} className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
                    aria-hidden
                  />
                </Link>

                <div className="flex flex-1 flex-col bg-slate-950 p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-white sm:text-lg">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{service.summary}</p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex min-h-10 items-center text-sm font-medium text-synergy-light transition hover:text-white"
                  >
                    Learn more
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
