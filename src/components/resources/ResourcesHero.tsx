import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { PremiumTitle } from "@/components/effects/PremiumTitle";

export const resourcesHeroBackground = "/images/resources/hero-background.png";

type ResourcesHeroProps = {
  title?: string;
  description?: string;
};

/**
 * Blog / resources index hero — full-bleed command-center visual.
 */
export function ResourcesHero({
  title = "Blog",
  description = "Latest news and insights on services, partners, and enterprise technology in Pakistan.",
}: ResourcesHeroProps) {
  return (
    <section className="relative isolate flex min-h-[420px] flex-col justify-center overflow-hidden border-b border-white/10 bg-[#05030A] py-16 sm:min-h-[520px] sm:py-20 lg:min-h-[580px]">
      <Image
        src={resourcesHeroBackground}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      {/* Left text shade — busy purple wall stays readable behind the title */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05030A]/88 via-[#05030A]/45 to-transparent lg:via-[#05030A]/25"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[#05030A]/20" aria-hidden />

      <div className="page-container relative z-10">
        <Reveal variant="fadeUp" className="max-w-2xl">
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
