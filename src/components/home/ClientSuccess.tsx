"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { caseStudies, type CaseStudy } from "@/lib/content/case-studies";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

function StoryCard({ story, className }: { story: CaseStudy; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={
        reduce
          ? undefined
          : {
              y: -8,
              boxShadow: "0 24px 48px -16px rgb(74 222 128 / 0.22)",
            }
      }
      transition={{ duration: motionDurations.hover, ease: motionEase }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800",
        "bg-slate-900/95 shadow-[0_0_0_1px_rgb(15_23_42/0.6)] backdrop-blur-sm",
        "transition-colors duration-300 hover:border-synergy/45",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={story.image}
          alt={story.client}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-sm">
          {story.industry}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{story.client}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">{story.headline}</h3>

        <ul className="mt-4 flex-1 space-y-2.5">
          {story.metrics.map((metric) => (
            <li key={metric} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-synergy-light" aria-hidden />
              {metric}
            </li>
          ))}
        </ul>

        <Link
          href={`/case-studies/${story.slug}`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-synergy-light transition group-hover:gap-3 group-hover:text-synergy-glow"
        >
          Read case study
          <span aria-hidden>→</span>
        </Link>
      </div>
    </motion.article>
  );
}

export function ClientSuccess() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const active = caseStudies[index];

  const goPrev = () => setIndex((i) => (i === 0 ? caseStudies.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === caseStudies.length - 1 ? 0 : i + 1));

  return (
    <section
      className="relative overflow-hidden border-y border-slate-800/80 bg-slate-950 section-y"
      aria-labelledby="client-success-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_0%,rgb(20_184_166/0.12),transparent)]"
        aria-hidden
      />

      <div className="page-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-synergy-light">Client success</p>
          <h2 id="client-success-heading" className="text-section-title mt-3 font-display font-bold text-white">
            Results that matter
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Measurable outcomes from enterprise deployments across banking, healthcare, and utilities.
          </p>
        </div>

        <ul className="mt-10 hidden gap-5 lg:mt-12 lg:grid lg:grid-cols-3 lg:gap-6">
          {caseStudies.map((story) => (
            <li key={story.slug}>
              <StoryCard story={story} />
            </li>
          ))}
        </ul>

        <div className="mt-10 lg:hidden">
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.slug}
                initial={reduce ? false : { opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -32 }}
                transition={{ duration: motionDurations.reveal, ease: motionEase }}
              >
                <StoryCard story={active} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous success story"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-synergy/40 hover:text-synergy-light"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {caseStudies.map((story, i) => (
                <button
                  key={story.slug}
                  type="button"
                  aria-label={`Show ${story.client}`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index ? "w-7 bg-synergy-light" : "w-2 bg-slate-600 hover:bg-slate-500",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next success story"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-synergy/40 hover:text-synergy-light"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
