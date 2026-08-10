import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { PremiumTitle } from "@/components/effects/PremiumTitle";
import { Button } from "@/components/ui/Button";
import { careersHeroBackground } from "@/lib/content/careers";

export function CareersHero() {
  return (
    <div className="relative isolate flex min-h-[520px] flex-col justify-center overflow-hidden bg-ink py-20 sm:min-h-[600px] sm:py-24 lg:min-h-[680px]">
      <Image
        src={careersHeroBackground}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      {/* Keep headline readable over the photo */}
      <div className="pointer-events-none absolute inset-0 bg-ink/70" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20"
        aria-hidden
      />

      <div className="page-container relative z-10">
        <Reveal variant="fadeUp">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Careers</p>
          <PremiumTitle
            as="h1"
            variant="hero"
            className="heading-shimmer-synergy mt-4 text-[2.75rem] font-bold leading-[1.05] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
          >
            Take your career
            <br />
            to the next
            <br />
            level
          </PremiumTitle>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Join a team building the infrastructure, applications, and support that keep Pakistan&apos;s
            leading enterprises running — 40+ years of hands-on IT experience, real projects from day one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#open-positions" variant="secondary" size="lg">
              View open positions
            </Button>
            <Button
              href="#apply"
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Submit general application
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
