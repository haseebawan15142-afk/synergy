import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { PremiumTitle } from "@/components/effects/PremiumTitle";

export const aboutHeroBackground = "/images/about/hero-background.png";

type AboutHeroProps = {
  title?: string;
  description?: string;
};

/**
 * About page hero — full-bleed boardroom / values visual.
 * Title sits on the left so the right-side value icons stay clear.
 */
export function AboutHero({
  title = "Driving excellence through technology",
  description,
}: AboutHeroProps) {
  return (
    <section className="relative isolate flex min-h-[420px] flex-col justify-center overflow-hidden border-b border-white/10 bg-[#05030A] py-16 sm:min-h-[520px] sm:py-20 lg:min-h-[580px]">
      <Image
        src={aboutHeroBackground}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05030A]/92 via-[#05030A]/55 to-transparent lg:via-[#05030A]/35 lg:to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[#05030A]/15" aria-hidden />

      <div className="page-container relative z-10">
        <Reveal variant="fadeUp" className="max-w-xl lg:max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e9d5ff]">
            Synergy Computers
          </p>
          <PremiumTitle
            as="h1"
            variant="hero"
            className="mt-3 font-display text-page-title font-bold text-white sm:text-5xl lg:text-6xl"
          >
            {title}
          </PremiumTitle>
          {description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:mt-5 sm:text-lg">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
