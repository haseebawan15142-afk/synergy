import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { PremiumTitle } from "@/components/effects/PremiumTitle";

export const contactHeroBackground = "/images/contact/hero-background.webp";

type ContactHeroProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

/**
 * Contact section with full-bleed office background.
 * Title uses the careers green text-shimmer; panels stay light so the photo shows through.
 */
export function ContactHero({ title, description, children }: ContactHeroProps) {
  return (
    <section className="relative isolate min-h-[min(92vh,920px)] overflow-hidden border-b border-border/40">
      <Image
        src={contactHeroBackground}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[28%_center] sm:object-center"
        aria-hidden
      />
      {/* Light veil — keep office + logo wall readable for visitors */}
      <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent lg:via-black/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20"
        aria-hidden
      />

      <div className="page-container relative z-10 flex min-h-[min(92vh,920px)] flex-col justify-center py-16 sm:py-20 lg:py-24">
        <Reveal variant="fadeUp" className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy-glow">
            Synergy Computers
          </p>
          <PremiumTitle
            as="h1"
            variant="hero"
            className="heading-shimmer-synergy text-page-title mt-3 font-bold sm:text-5xl lg:text-6xl"
          >
            {title}
          </PremiumTitle>
          {description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:mt-5 sm:text-lg">
              {description}
            </p>
          ) : null}
        </Reveal>

        {/* Leave right side open so the meeting / skyline stays visible on large screens */}
        <div className="mt-10 w-full max-w-lg lg:mt-12 lg:max-w-md xl:max-w-lg">{children}</div>
      </div>
    </section>
  );
}
