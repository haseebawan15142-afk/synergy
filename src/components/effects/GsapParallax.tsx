"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

type GsapParallaxProps = {
  className?: string;
  children: ReactNode;
};

/** Client-only parallax wrapper — avoids React hydration mismatches from GSAP inline transforms. */
export function GsapParallax({ className, children }: GsapParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    if (mobile) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: -36,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
