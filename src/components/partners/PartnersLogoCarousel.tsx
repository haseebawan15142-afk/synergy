"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { partners, type Partner } from "@/lib/content/partners";
import { cn } from "@/lib/cn";

type PartnersLogoCarouselProps = {
  title?: string;
  items?: Partner[];
  className?: string;
};

function useVisibleCount() {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 1024) setCount(3);
      else setCount(5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {direction === "left" ? (
        <path
          d="M14 6L8 12L14 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10 6L16 12L10 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function PartnersLogoCarousel({
  title = "Trusted by enterprise customers and technology partners",
  items = partners,
  className,
}: PartnersLogoCarouselProps) {
  const visibleCount = useVisibleCount();
  const [index, setIndex] = useState(0);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(maxIndex, i + 1));
  }, [maxIndex]);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || maxIndex <= 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, maxIndex]);

  const itemWidth = 100 / visibleCount;

  return (
    <section
      className={cn("border-y border-border/60 bg-surface-elevated/90 py-14 shadow-soft", className)}
      aria-labelledby="partners-carousel-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="page-container py-8 sm:py-6">
        <h2
          id="partners-carousel-heading"
          className="text-center text-xs font-bold uppercase tracking-[0.25em] text-ink-muted sm:text-sm"
        >
          {title}
        </h2>

        <div className="relative mt-8 flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous partners"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink-muted shadow-soft transition hover:border-synergy/30 hover:text-synergy disabled:pointer-events-none disabled:opacity-30"
          >
            <Chevron direction="left" />
          </button>

          <div className="min-w-0 flex-1 overflow-hidden">
            <ul
              className="flex ease-in-out"
              style={{
                transform: `translate3d(-${index * itemWidth}%, 0, 0)`,
                transition: "transform 500ms ease-in-out",
              }}
            >
              {items.map((p) => (
                <li
                  key={p.name}
                  className="flex shrink-0 items-center justify-center px-3 sm:px-4"
                  style={{ width: `${itemWidth}%` }}
                >
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-14 w-full max-w-[160px] items-center justify-center opacity-90 transition hover:opacity-100 sm:h-16"
                  >
                    <Image
                      src={p.logo}
                      alt={p.name}
                      width={160}
                      height={64}
                      className="max-h-12 w-auto max-w-full object-contain sm:max-h-14"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next partners"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white text-ink-muted shadow-soft transition hover:border-synergy/30 hover:text-synergy disabled:pointer-events-none disabled:opacity-30"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
