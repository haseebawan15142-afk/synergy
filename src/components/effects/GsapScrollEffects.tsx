"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

function refreshScrollTriggers() {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** Site-wide GSAP ScrollTrigger reveals (blur-to-focus, parallax layers). */
export function GsapScrollEffects() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const blurAmount = mobile ? "blur(8px)" : "blur(16px)";
    const blurOffset = mobile ? 20 : 32;

    let ctx: gsap.Context | undefined;

    const frame = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const blurEls = gsap.utils.toArray<HTMLElement>("[data-gsap-blur]");
        blurEls.forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            filter: blurAmount,
            y: blurOffset,
            duration: mobile ? 0.75 : 1.1,
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

      refreshScrollTriggers();
    });

    window.addEventListener("load", refreshScrollTriggers);
    window.addEventListener("orientationchange", refreshScrollTriggers);
    window.addEventListener("resize", refreshScrollTriggers);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refreshScrollTriggers);
      window.removeEventListener("orientationchange", refreshScrollTriggers);
      window.removeEventListener("resize", refreshScrollTriggers);
      ctx?.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduce]);

  return null;
}
