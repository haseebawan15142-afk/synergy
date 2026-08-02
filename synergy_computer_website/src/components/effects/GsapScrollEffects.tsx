"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

/** Site-wide GSAP ScrollTrigger reveals (blur-to-focus, parallax layers). */
export function GsapScrollEffects() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const blurEls = gsap.utils.toArray<HTMLElement>("[data-gsap-blur]");
    blurEls.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, filter: "blur(16px)", y: 32 },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        },
      );
    });

    const parallaxEls = gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]");
    parallaxEls.forEach((el) => {
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
    });

    const cards = gsap.utils.toArray<HTMLElement>("[data-gsap-rise]");
    cards.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          delay: (i % 3) * 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduce]);

  return null;
}
