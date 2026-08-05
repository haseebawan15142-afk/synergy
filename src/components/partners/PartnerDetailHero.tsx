"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HeroTextRotator } from "@/components/home/HeroTextRotator";
import type { Partner } from "@/lib/content/partners";

type PartnerDetailHeroProps = {
  partner: Partner;
};

export function PartnerDetailHero({ partner }: PartnerDetailHeroProps) {
  const reduce = useReducedMotion();
  const taglines = (partner.taglines ?? []).filter(Boolean);
  const label = partner.category?.trim() || "Strategic partner";
  const slides = taglines.map((heading) => ({ label, heading }));
  const heroSrc = partner.heroImageUrl?.trim() || "";

  return (
    <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden border-b border-border/40">
      <div className="absolute inset-0" aria-hidden>
        {heroSrc ? (
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={reduce ? undefined : { scale: [1, 1.08] }}
            transition={
              reduce
                ? undefined
                : { duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }
            }
          >
            <Image
              src={heroSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.75))",
          }}
        />
      </div>

      <div className="relative z-10 page-container flex min-h-[min(72vh,640px)] flex-col justify-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left">
          {partner.logo ? (
            <div className="mx-auto mb-6 inline-flex h-16 w-auto items-center justify-center rounded-xl bg-white px-5 py-3 shadow-soft lg:mx-0">
              <Image
                src={partner.logo}
                alt={`${partner.name} logo`}
                width={180}
                height={56}
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ) : null}

          {slides.length > 0 ? (
            <HeroTextRotator
              slides={slides}
              headingId={`partner-heading-${partner.slug || "detail"}`}
            />
          ) : (
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-synergy-glow sm:text-xs sm:tracking-[0.26em]">
                {label}
              </p>
              <h1
                id={`partner-heading-${partner.slug || "detail"}`}
                className="text-hero mt-3 font-bold leading-[1.08] text-white sm:mt-4"
              >
                <span className="text-gradient-live">{partner.name}</span>
              </h1>
            </div>
          )}

          {partner.shortDescription ? (
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:mt-6 sm:text-lg lg:mx-0">
              {partner.shortDescription}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
