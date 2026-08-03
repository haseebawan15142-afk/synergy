import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export function CareersCtaSection() {
  return (
    <section className="border-t border-border/60 section-y">
      <div className="page-container">
        <Reveal variant="fadeUp">
          <div className="overflow-hidden rounded-3xl bg-gradient-brand px-6 py-12 text-center text-on-synergy shadow-card sm:px-12 sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">How can we help you?</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Ready to build your career with Synergy Computers?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
              Browse current openings or send us your CV — we&apos;re always looking for people who want to
              build real skills on real enterprise IT projects.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="#open-positions" variant="secondary" size="lg">
                View open positions
              </Button>
              <Button href="/contact" variant="ghost" size="lg" className="text-on-synergy hover:bg-white/15">
                Talk to us
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
