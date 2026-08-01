"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  heroVideoIntervalMs,
  heroVideoTransitionMs,
  heroVideos,
} from "@/lib/content/hero-videos";

export function HeroVideoBackground() {
  const [enabled, setEnabled] = useState(false);
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!prefersReduced);
  }, []);

  useEffect(() => {
    if (!enabled || heroVideos.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroVideos.length);
    }, heroVideoIntervalMs);

    return () => window.clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      if (i === current) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current, enabled]);

  if (!enabled) {
    return <div className="absolute inset-0 bg-ink" aria-hidden />;
  }

  return (
    <>
      {heroVideos.map((video, i) => (
        <video
          key={video.src}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover",
            "transition-opacity ease-in-out",
            i === current ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${heroVideoTransitionMs}ms` }}
          autoPlay={i === 0}
          muted
          loop
          playsInline
          preload={i <= 1 ? "auto" : "metadata"}
          poster={video.poster}
          aria-hidden
        >
          <source src={video.src} type="video/mp4" />
        </video>
      ))}
      <div className="pointer-events-none absolute inset-0 bg-ink/55" aria-hidden />
    </>
  );
}
