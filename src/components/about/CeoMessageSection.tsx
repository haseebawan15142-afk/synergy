"use client";

import dynamic from "next/dynamic";
import { ceoMessage } from "@/lib/content/ceo-message";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const CeoVideoPlayer = dynamic(
  () => import("@/components/about/CeoVideoPlayer").then((m) => m.CeoVideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div
        className="aspect-video w-full bg-slate-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${ceoMessage.posterSrc})` }}
        aria-hidden
      />
    ),
  },
);

export function CeoMessageSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-border/60 bg-surface-muted/60 section-y"
      aria-labelledby="ceo-message-heading"
    >
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="ceo-message-heading"
            eyebrow="Leadership"
            title="Message from our CEO"
            description="A note on Synergy's direction, values, and commitment to the organizations we serve."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
          <Reveal variant="fadeUp">
            <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-elevated shadow-soft">
              <div className="relative aspect-video bg-slate-900">
                <CeoVideoPlayer />
              </div>
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.08}>
            <div className="flex h-full flex-col rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-synergy">{ceoMessage.role}</p>
              <h3 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{ceoMessage.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{ceoMessage.company}</p>

              <blockquote className="mt-6 border-l-2 border-synergy/40 pl-4 text-base leading-relaxed text-ink sm:text-lg">
                “{ceoMessage.quote}”
              </blockquote>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-body sm:text-base">
                {ceoMessage.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
