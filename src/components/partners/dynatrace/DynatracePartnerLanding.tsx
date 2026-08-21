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
import { Button } from "@/components/ui/Button";
import { dynatracePartner } from "@/lib/content/dynatrace-partner";
import { fetchSiteSettings } from "@/lib/cms/public-server";
import { cn } from "@/lib/cn";

const featureIcons = {
  sparkles: Sparkles,
  activity: Activity,
  building: Building2,
} as const;

const challengeIcons = {
  code: Code2,
  server: Server,
  user: UserRound,
} as const;

const impactIcons = {
  clock: Clock3,
  shield: Shield,
  chart: BarChart3,
  bulb: Lightbulb,
} as const;

const toneRing: Record<string, string> = {
  purple: "border-violet-400/40 bg-violet-500/15 text-violet-300",
  blue: "border-sky-400/40 bg-sky-500/15 text-sky-300",
  pink: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300",
  orange: "border-orange-400/40 bg-orange-500/15 text-orange-300",
};

/**
 * Full Dynatrace partner landing — matches the approved design mockup.
 * Do not reuse for other partners until the user explicitly approves.
 */
export async function DynatracePartnerLanding() {
  const settings = await fetchSiteSettings();
  const { hero, challenge, approach, capabilities, impact, cta } = dynatracePartner;

  return (
    <div className="bg-[#05030A] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src="/images/dynatrace/page-bg.png"
            alt=""
            className="h-full w-full object-cover object-[72%_center]"
          />
          {/* Soft left shade for text only — no blur */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,3,10,0.78) 0%, rgba(5,3,10,0.35) 38%, rgba(5,3,10,0.08) 62%, transparent 78%)",
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
              <li className="font-medium text-white/70">Dynatrace</li>
            </ol>
          </nav>

          <div className="mt-8 max-w-2xl lg:mt-10">
            <Reveal>
              <img
                src="/images/partner-logos/dynatrace.webp"
                alt="Dynatrace"
                className="h-9 w-auto object-contain sm:h-10"
              />

              <h1 className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
                {hero.titleLead}{" "}
                <span className="bg-gradient-to-r from-[#a78bfa] via-[#e879f9] to-[#fb923c] bg-clip-text text-transparent">
                  {hero.titleGradientA}
                </span>{" "}
                {hero.titleMid}{" "}
                <span className="bg-gradient-to-r from-[#fb923c] via-[#c084fc] to-[#818cf8] bg-clip-text text-transparent">
                  {hero.titleGradientB}
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
                {hero.subtitle}
              </p>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
                {hero.features.map((f) => {
                  const Icon = featureIcons[f.icon];
                  return (
                    <li key={f.label} className="inline-flex items-center gap-2 text-sm text-white/80">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/35 bg-violet-500/15 text-violet-300">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {f.label}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={hero.primaryCta.href} variant="primary" className="!bg-gradient-cta">
                  {hero.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
                <Button
                  href={hero.secondaryCta.href}
                  variant="secondary"
                  className="border-white/20 bg-transparent text-white hover:border-violet-400/50 hover:text-white"
                >
                  {hero.secondaryCta.label}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Challenge */}
      <section className="section-y border-b border-white/10" aria-labelledby="dt-challenge-heading">
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {challenge.eyebrow}
            </p>
            <h2
              id="dt-challenge-heading"
              className="mt-3 max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {challenge.title}
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {challenge.items.map((item, i) => {
              const Icon = challengeIcons[item.icon];
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
      <section className="section-y border-b border-white/10" aria-labelledby="dt-approach-heading">
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {approach.eyebrow}
            </p>
            <h2
              id="dt-approach-heading"
              className="mt-3 max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {approach.title}
            </h2>
          </Reveal>

          <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-3">
            {approach.steps.map((step, index) => (
              <div key={step.title} className="contents">
                <Reveal delay={index * 0.08} className="min-w-0 flex-1">
                  <div className="digital-card flex h-full flex-col items-center px-5 py-7 text-center sm:px-7 sm:py-8">
                    <div className="relative z-[1] flex h-16 w-full items-center justify-center">
                      {step.kind === "dynatrace" ? (
                        <img
                          src="/images/partner-logos/dynatrace.webp"
                          alt=""
                          className="mx-auto h-10 w-auto max-w-[11rem] object-contain object-center"
                        />
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
                {index < approach.steps.length - 1 ? (
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
        aria-labelledby="dt-capabilities-heading"
      >
        <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {capabilities.eyebrow}
            </p>
            <h2
              id="dt-capabilities-heading"
              className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {capabilities.title}
            </h2>

            <ul className="mt-8 space-y-4">
              {capabilities.items.map((item, index) => {
                const CapIcon =
                  [Activity, Server, UserRound, Sparkles, Building2][index] ?? Activity;
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
              href={capabilities.linkHref}
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c4b5fd] transition hover:text-white"
            >
              {capabilities.linkLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <DynatraceSmartscapeMock />
          </Reveal>
        </div>
      </section>

      {/* Business Impact */}
      <section className="section-y border-b border-white/10" aria-labelledby="dt-impact-heading">
        <div className="page-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
              {impact.eyebrow}
            </p>
            <h2
              id="dt-impact-heading"
              className="mt-3 max-w-3xl font-display text-3xl font-bold text-white sm:text-4xl"
            >
              {impact.title}
            </h2>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {impact.items.map((item, i) => {
              const Icon = impactIcons[item.icon];
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
      <section className="section-y" aria-labelledby="dt-cta-heading">
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
                    <h2 id="dt-cta-heading" className="text-xl font-bold text-white sm:text-2xl">
                      {cta.title}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                      {cta.description}
                    </p>
                  </div>
                </div>
                <Button href={cta.buttonHref} variant="primary" size="lg" className="!bg-gradient-cta shrink-0">
                  {cta.buttonLabel}
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
