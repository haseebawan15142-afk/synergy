import { ceoMessage } from "@/lib/content/ceo-message";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export function CeoMessageSection() {
  return (
    <section className="border-y border-border/60 bg-surface-muted/60 section-y" aria-labelledby="ceo-message-heading">
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
                <video
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster={ceoMessage.posterSrc}
                  aria-label={`Video message from ${ceoMessage.name}`}
                >
                  <source src={ceoMessage.videoSrc} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
              </div>
              <p className="border-t border-border/70 px-4 py-3 text-xs text-ink-muted">
                
                <code className="rounded bg-surface-muted px-1 py-0.5 text-[11px]">public/videos/</code>
              </p>
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
