import Image from "next/image";
import { GsapParallax } from "@/components/effects/GsapParallax";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="page-container section-y-tight mb-12 sm:mb-16">
      <GsapParallax className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <Image
          src="/images/home/cta-band-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
          priority={false}
        />
        {/* Keep text readable over the busy office scene */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#12081f]/88 via-[#1a0f18]/70 to-[#2a1810]/75"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/35" aria-hidden />

        <div className="relative px-5 py-12 text-center sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9d5ff]">Next step</p>
          <h2 className="text-section-title mt-3 font-display font-bold text-white">Meet with an expert</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 sm:text-base">
            Tell us about your environment and goals. We&apos;ll help you shape a practical plan — contact
            our team in Karachi or any branch.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Button href="/contact" size="lg" className="w-full sm:w-auto">
              Get in touch
            </Button>
            <a
              href="mailto:info@synergy.net.pk"
              className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              info@synergy.net.pk
            </a>
          </div>
        </div>
      </GsapParallax>
    </section>
  );
}
