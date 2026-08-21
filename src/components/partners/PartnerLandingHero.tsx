"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HeroTextRotator } from "@/components/home/HeroTextRotator";
import { ResilientImage, ResilientImg } from "@/components/media/ResilientImage";
import { Button } from "@/components/ui/Button";
import { partners as localPartners, type Partner } from "@/lib/content/partners";
import type { PartnerLandingContent } from "@/lib/content/partner-landing";

type PartnerLandingHeroProps = {
  partner: Partner;
  content: PartnerLandingContent;
};

export function PartnerLandingHero({ partner, content }: PartnerLandingHeroProps) {
  const taglines = (partner.taglines ?? []).filter(Boolean);
  const label = partner.category?.trim() || "Strategic partner";
  const slides = taglines.map((heading) => ({ label, heading }));
  const local = localPartners.find(
    (p) => (p.slug || p.name).toLowerCase() === (partner.slug || partner.name).toLowerCase(),
  );
  const logoFallback = local?.logo;
  const heroFallback = local?.heroImageUrl?.trim() || "";
  const heroSrc = content.heroBg || partner.heroImageUrl?.trim() || "";

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {heroSrc ? (
          <ResilientImage
            src={heroSrc}
            fallbackSrc={heroFallback || undefined}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 85% 20%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(255,106,0,0.14), transparent 50%), #05030A",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,3,10,0.55) 0%, rgba(5,3,10,0.2) 42%, transparent 72%)",
          }}
        />
      </div>

      <div className="page-container relative py-10 sm:py-14 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-xs text-white/45 sm:text-sm">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition hover:text-white/80">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-white/25">
              /
            </li>
            <li>
              <Link href="/partners" className="transition hover:text-white/80">
                Partners
              </Link>
            </li>
            <li aria-hidden className="text-white/25">
              /
            </li>
            <li className="font-medium text-white/70">{partner.name}</li>
          </ol>
        </nav>

        <div className="mt-8 max-w-2xl lg:mt-10">
          {partner.logo ? (
            <div className="mb-6 inline-flex h-12 min-w-[9rem] items-center justify-center">
              {/\.svg(\?|$)/i.test(partner.logo) ||
              (logoFallback ? /\.svg(\?|$)/i.test(logoFallback) : false) ? (
                <ResilientImg
                  src={partner.logo}
                  fallbackSrc={logoFallback}
                  alt={`${partner.name} logo`}
                  className="h-10 w-auto max-w-[14rem] object-contain object-left"
                />
              ) : (
                <ResilientImage
                  src={partner.logo}
                  fallbackSrc={logoFallback}
                  alt={`${partner.name} logo`}
                  width={220}
                  height={44}
                  className="h-10 w-auto max-w-[14rem] object-contain object-left"
                />
              )}
            </div>
          ) : null}

          {content.heroHeadline ? (
            <h1
              id={`partner-heading-${partner.slug || "detail"}`}
              className="max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]"
            >
              {content.heroHeadline.titleLead}{" "}
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#e879f9] to-[#fb923c] bg-clip-text text-transparent">
                {content.heroHeadline.titleGradientA}
              </span>{" "}
              {content.heroHeadline.titleMid}{" "}
              <span className="bg-gradient-to-r from-[#fb923c] via-[#c084fc] to-[#818cf8] bg-clip-text text-transparent">
                {content.heroHeadline.titleGradientB}
              </span>
            </h1>
          ) : slides.length > 0 ? (
            <HeroTextRotator
              slides={slides}
              headingId={`partner-heading-${partner.slug || "detail"}`}
              className="[&_h1]:!text-4xl [&_h1]:sm:!text-5xl [&_h1]:lg:!text-[3.2rem] [&_p]:!text-[#c4b5fd]"
            />
          ) : (
            <h1
              id={`partner-heading-${partner.slug || "detail"}`}
              className="font-display text-4xl font-bold text-white sm:text-5xl"
            >
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#fb923c] bg-clip-text text-transparent">
                {partner.name}
              </span>
            </h1>
          )}

          {/* When fixed headline is used, still rotate the 3 taglines underneath */}
          {content.heroHeadline && slides.length > 0 ? (
            <div className="mt-5">
              <HeroTextRotator
                slides={slides}
                headingId={`partner-taglines-${partner.slug || "detail"}`}
                className="[&_h1]:!text-2xl [&_h1]:sm:!text-3xl [&_p]:!text-[#c4b5fd]"
              />
            </div>
          ) : null}

          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            {content.subtitle}
          </p>

          {content.features.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {content.features.map((labelText) => (
                <li
                  key={labelText}
                  className="inline-flex items-center gap-2 text-sm text-white/80"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/35 bg-violet-500/15 text-violet-300">
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </span>
                  {labelText}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#capabilities" variant="primary" className="!bg-gradient-cta">
              Explore {partner.name}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
            <Button
              href="/contact"
              variant="secondary"
              className="border-white/20 bg-transparent text-white hover:border-violet-400/50 hover:text-white"
            >
              Talk to an Expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
