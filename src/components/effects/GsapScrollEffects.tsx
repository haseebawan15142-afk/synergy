"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Desktop-only GSAP ScrollTrigger reveals — skipped on mobile to save CPU. */
export function GsapScrollEffects() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    let debouncedRefresh: (() => void) | undefined;

    mm.add("(min-width: 769px)", () => {
      const ctx = gsap.context(() => {
        const blurEls = gsap.utils.toArray<HTMLElement>("[data-gsap-blur]");
        blurEls.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            filter: "blur(16px)",
            y: 32,
            duration: 1.1,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          });
        });

        const cards = gsap.utils.toArray<HTMLElement>("[data-gsap-rise]");
        cards.forEach((el, i) => {
          gsap.from(el, {
            opacity: 0,
            y: 40,
            duration: 0.95,
            delay: (i % 3) * 0.06,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              once: true,
            },
          });
        });
      });

      debouncedRefresh = debounce(() => ScrollTrigger.refresh(), 250);
      window.addEventListener("load", debouncedRefresh);
      window.addEventListener("orientationchange", debouncedRefresh);
      window.addEventListener("resize", debouncedRefresh);

      return () => {
        if (debouncedRefresh) {
          window.removeEventListener("load", debouncedRefresh);
          window.removeEventListener("orientationchange", debouncedRefresh);
          window.removeEventListener("resize", debouncedRefresh);
        }
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, [reduce]);

  return null;
}
