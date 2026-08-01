"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type GallerySlide = {
  src: string;
  alt: string;
};

type DynatracePartnerGalleryProps = {
  slides: readonly GallerySlide[];
  intervalMs?: number;
  className?: string;
};

export function DynatracePartnerGallery({
  slides,
  intervalMs = 5500,
  className,
}: DynatracePartnerGalleryProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs, paused]);

  if (slides.length === 0) return null;

  return (
    <div
      className={cn("relative aspect-[4/3] overflow-hidden bg-surface-muted", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => {
        const offset = (i - index) * 100;
        const isActive = i === index;

        return (
          <div
            key={slide.src}
            className="absolute inset-0 h-full w-full"
            style={{
              transform: `translate3d(${offset}%, 0, 0)`,
              transition: "transform 700ms ease-in-out",
              zIndex: isActive ? 2 : 1,
            }}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.src}
              alt={isActive ? slide.alt : ""}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        );
      })}

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
