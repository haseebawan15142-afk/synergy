"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export type HeroHeadlineSlide = {
  label: string;
  heading: string;
};

export const defaultHeroHeadlines: HeroHeadlineSlide[] = [
  {
    label: "Your trusted partner in",
    heading: "Digital Transform",
  },
  {
    label: "Empowering enterprises with",
    heading: "Scalable IT Solutions",
  },
  {
    label: "Driving business growth",
    heading: "Through AI-Powered Innovation",
  },
];

const INTERVAL_MS = 5000;
const TRANSITION_S = 0.7;
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

type HeroTextRotatorProps = {
  slides?: HeroHeadlineSlide[];
  intervalMs?: number;
  className?: string;
  /** Element id for the live heading (accessibility / skip targets). */
  headingId?: string;
};

export function HeroTextRotator({
  slides = defaultHeroHeadlines,
  intervalMs = INTERVAL_MS,
  className,
  headingId = "hero-heading",
}: HeroTextRotatorProps) {
  const reduce = useReducedMotion();
  const regionId = useId();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;
  const active = slides[index] ?? slides[0];

  const goTo = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (reduce || paused || count < 2) return;
    const id = window.setInterval(goNext, intervalMs);
    return () => window.clearInterval(id);
  }, [reduce, paused, count, intervalMs, goNext]);

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  if (!active) return null;

  return (
    <div
      className={cn("w-full", className)}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={regionId}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p id={regionId} className="sr-only">
        Homepage headline carousel. Slide {index + 1} of {count}.
      </p>

      <div
        className="relative min-h-[7.5rem] sm:min-h-[9rem] lg:min-h-[10.5rem]"
        aria-live={reduce ? "off" : "polite"}
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: TRANSITION_S, ease: EASE }
            }
            className="w-full"
          >
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-synergy-glow sm:text-xs sm:tracking-[0.26em]">
              {active.label}
            </p>
            <h1
              id={headingId}
              className="text-hero mt-3 font-bold leading-[1.08] text-white sm:mt-4"
            >
              <span className="text-gradient-live">{active.heading}</span>
            </h1>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div
          className="mt-6 flex items-center justify-center gap-2 lg:justify-start"
          role="tablist"
          aria-label="Headline slides"
        >
          {slides.map((slide, i) => {
            const selected = i === index;
            return (
              <button
                key={`${slide.label}-${slide.heading}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show headline ${i + 1}: ${slide.heading}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synergy-glow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                  selected
                    ? "w-8 bg-synergy-light"
                    : "w-3 bg-white/35 hover:bg-white/55",
                )}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
