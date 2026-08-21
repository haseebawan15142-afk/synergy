import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Code2,
  Lightbulb,
  Server,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { CmsBrandLogo } from "@/components/brand/CmsBrandLogo";
import { Reveal } from "@/components/motion/Reveal";
import { DynatraceSmartscapeMock } from "@/components/partners/dynatrace/DynatraceSmartscapeMock";
import { PartnerLandingHero } from "@/components/partners/PartnerLandingHero";
import { Button } from "@/components/ui/Button";
import { ResilientImage, ResilientImg } from "@/components/media/ResilientImage";
import { buildPartnerLandingContent } from "@/lib/content/partner-landing";
import { partners as localPartners, type Partner } from "@/lib/content/partners";
import { fetchSiteSettings } from "@/lib/cms/public-server";
import { cn } from "@/lib/cn";

const challengeIcons = [Code2, Server, UserRound] as const;
const impactIcons = [Clock3, Shield, BarChart3, Lightbulb] as const;
const capabilityIcons = [Activity, Server, Sparkles, Building2, Shield, Lightbulb] as const;

const toneRing: Record<string, string> = {
  purple: "border-violet-400/40 bg-violet-500/15 text-violet-300",
  blue: "border-sky-400/40 bg-sky-500/15 text-sky-300",
  pink: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300",
  orange: "border-orange-400/40 bg-orange-500/15 text-orange-300",
};

type PartnerLandingPageProps = {
  partner: Partner;
};

/**
 * Full partner landing used for every partner detail page.
 * Content is partner-specific; Dynatrace keeps its special hero treatment.
 */
export async function PartnerLandingPage({ partner }: PartnerLandingPageProps) {
  const settings = await fetchSiteSettings();
  const content = buildPartnerLandingContent(partner);
  const local = localPartners.find(
    (p) => (p.slug || p.name).toLowerCase() === (partner.slug || partner.name).toLowerCase(),
  );
  const logoFallback = local?.logo;
  const { challenge, approachTitle, capabilities, impact, cta } = content;
  const sid = partner.slug || "partner";

  return (
    <div className="bg-[#05030A] text-white">
      <PartnerLandingHero partner={partner} content={content} />

      {/* The Challenge */}
      <section className="section-y border-b border-white/10" aria-labelledby={`${sid}-challenge-heading`}>
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {challenge.eyebrow}
            </p>
            <h2
              id={`${sid}-challenge-heading`}
              className="mt-3 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {challenge.title}
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {challenge.items.map((item, i) => {
              const Icon = challengeIcons[i] ?? Code2;
              return (
                <Reveal key={item.title} delay={Math.min(i * 0.06, 0.18)} as="li">
                  <div className="digital-card h-full p-5 sm:p-6">
                    <span
                      className={cn(
                        "relative z-[1] inline-flex h-11 w-11 items-center justify-center rounded-full border",
                        toneRing[item.tone],
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="relative z-[1] mt-5 text-lg font-bold text-white">{item.title}</h3>
                    <p className="relative z-[1] mt-2 text-sm leading-relaxed text-white/60">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Our Approach */}
      <section className="section-y border-b border-white/10" aria-labelledby={`${sid}-approach-heading`}>
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              Our Approach
            </p>
            <h2
              id={`${sid}-approach-heading`}
              className="mt-3 max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {approachTitle}
            </h2>
          </Reveal>

          <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-3">
            {[
              { kind: "partner" as const, title: partner.name, description: `Powerful ${partner.category?.toLowerCase() || "technology"} platform.` },
              { kind: "synergy" as const, title: "Synergy", description: "Implementation, integration & optimization." },
              { kind: "business" as const, title: "Your Business", description: "Better performance, smarter decisions." },
            ].map((step, index) => (
              <div key={step.title} className="contents">
                <Reveal delay={index * 0.08} className="min-w-0 flex-1">
                  <div className="digital-card flex h-full flex-col items-center px-5 py-7 text-center sm:px-7 sm:py-8">
                    <div className="relative z-[1] flex h-16 w-full items-center justify-center">
                      {step.kind === "partner" && partner.logo ? (
                        /\.svg(\?|$)/i.test(partner.logo) ||
                        (logoFallback ? /\.svg(\?|$)/i.test(logoFallback) : false) ? (
                          <ResilientImg
                            src={partner.logo}
                            fallbackSrc={logoFallback}
                            alt=""
                            className="mx-auto h-10 w-auto max-w-[11rem] object-contain object-center"
                          />
                        ) : (
                          <ResilientImage
                            src={partner.logo}
                            fallbackSrc={logoFallback}
                            alt=""
                            width={200}
                            height={40}
                            className="mx-auto h-10 w-auto max-w-[11rem] object-contain object-center"
                          />
                        )
                      ) : null}
                      {step.kind === "synergy" ? (
                        <CmsBrandLogo
                          variant="header"
                          theme="dark"
                          className="!h-auto max-w-full justify-center [&_img]:mx-auto [&_img]:!h-10 [&_img]:!max-h-10 [&_img]:!w-auto [&_img]:!max-w-[10.5rem] [&_img]:!object-contain [&_img]:!object-center"
                          logoUrl={settings.logoUrl}
                          darkLogoUrl={settings.darkLogoUrl}
                          footerLogoUrl={settings.footerLogoUrl}
                          companyName={settings.legalName || settings.companyName}
                        />
                      ) : null}
                      {step.kind === "business" ? (
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-orange-400/40 bg-orange-500/15 text-orange-300">
                          <BarChart3 className="h-6 w-6" aria-hidden />
                        </span>
                      ) : null}
                    </div>
                    <p className="relative z-[1] mt-5 text-sm font-bold uppercase tracking-[0.14em] text-white">
                      {step.title}
                    </p>
                    <p className="relative z-[1] mt-2 max-w-[16rem] text-sm leading-relaxed text-white/55">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
                {index < 2 ? (
                  <div
                    className={cn(
                      "mx-auto hidden h-1 w-10 shrink-0 rounded-full lg:block",
                      index === 0
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-400"
                        : "bg-gradient-to-r from-orange-400 to-amber-300",
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="capabilities"
        className="section-y border-b border-white/10"
        aria-labelledby={`${sid}-capabilities-heading`}
      >
        <div
          className={cn(
            "page-container grid items-start gap-10 lg:gap-14",
            content.showSmartscape ? "lg:grid-cols-2 lg:items-center" : "",
          )}
        >
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {capabilities.eyebrow}
            </p>
            <h2
              id={`${sid}-capabilities-heading`}
              className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {capabilities.title}
            </h2>

            {partner.overview ? (
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/60 sm:text-base">
                {partner.overview}
              </p>
            ) : null}

            <ul className="mt-8 space-y-4">
              {capabilities.items.map((item, index) => {
                const CapIcon = capabilityIcons[index % capabilityIcons.length] ?? Activity;
                return (
                  <li key={item.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/35 bg-violet-500/15 text-violet-300">
                      <CapIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c4b5fd] transition hover:text-white"
            >
              Talk to Synergy about {partner.name}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>

          {content.showSmartscape ? (
            <Reveal delay={0.1}>
              <DynatraceSmartscapeMock />
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Business Impact */}
      <section className="section-y border-b border-white/10" aria-labelledby={`${sid}-impact-heading`}>
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {impact.eyebrow}
            </p>
            <h2
              id={`${sid}-impact-heading`}
              className="mt-3 max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {impact.title}
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {impact.items.map((item, i) => {
              const Icon = impactIcons[i] ?? Clock3;
              return (
                <Reveal key={item.title} delay={Math.min(i * 0.05, 0.2)} as="li">
                  <div className="h-full text-center sm:text-left">
                    <span
                      className={cn(
                        "inline-flex h-12 w-12 items-center justify-center rounded-2xl border",
                        toneRing[item.tone],
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-y" aria-labelledby={`${sid}-cta-heading`}>
        <div className="page-container">
          <Reveal>
            <div className="digital-card relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/25 blur-3xl"
                aria-hidden
              />
              <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-4">
                  <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/40 bg-violet-500/15 text-violet-300 sm:inline-flex">
                    <UserRound className="h-7 w-7" aria-hidden />
                  </span>
                  <div>
                    <h2 id={`${sid}-cta-heading`} className="text-xl font-bold text-white sm:text-2xl">
                      {cta.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                      {cta.description}
                    </p>
                  </div>
                </div>
                <Button href="/contact" variant="primary" size="lg" className="!bg-gradient-cta shrink-0">
                  Talk to our experts
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 text-center">
            <Link href="/partners" className="text-sm font-semibold text-white/50 transition hover:text-white">
              ← All partners
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
