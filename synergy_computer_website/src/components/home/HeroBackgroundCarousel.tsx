"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  heroCarouselMs,
  heroSlideTransitionMs,
  heroSlides,
} from "@/lib/content/hero-slides";

export function HeroBackgroundCarousel() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 400], [0, reduce ? 0 : 32]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, heroCarouselMs);

    return () => window.clearInterval(timer);
  }, []);

  if (heroSlides.length === 0) {
    return <div className="absolute inset-0 bg-ink" aria-hidden />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden>
      {heroSlides.map((slide, i) => {
        const offset = (i - index) * 100;
        const isActive = i === index;
        return (
          <div
            key={slide.src}
            className="absolute inset-0 h-full w-full"
            style={{
              transform: `translate3d(${offset}%, 0, 0)`,
              transition: `transform ${heroSlideTransitionMs}ms ease-in-out`,
              zIndex: isActive ? 2 : 1,
            }}
          >
            {isActive && !reduce ? (
              <motion.div className="h-full w-full" style={{ y: parallaxY }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed slide carousel */}
                <img
                  src={slide.src}
                  alt=""
                  className="h-[108%] w-full object-cover object-center"
                  draggable={false}
                  decoding="async"
                />
              </motion.div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element -- full-bleed slide carousel */
              <img
                src={slide.src}
                alt=""
                className="h-full w-full object-cover object-center"
                draggable={false}
                decoding="async"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
