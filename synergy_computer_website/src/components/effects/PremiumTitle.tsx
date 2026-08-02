"use client";

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type PremiumTitleProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  shimmer?: boolean;
  variant?: "hero" | "section";
  id?: string;
};

export function PremiumTitle({
  as: Tag = "h2",
  className,
  children,
  shimmer = true,
  variant = "section",
  id,
}: PremiumTitleProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;

    if (variant === "hero") {
      gsap.fromTo(
        el,
        { opacity: 0, filter: "blur(16px)", y: 24 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.05, ease: "power3.out", delay: 0.08 },
      );
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      el,
      { opacity: 0, filter: "blur(14px)", y: 28 },
      {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          toggleActions: "play none none none",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [reduce, variant]);

  return createElement(
    Tag,
    {
      ref,
      id,
      className: cn(
        "font-display tracking-tight",
        shimmer && !reduce && "heading-shimmer",
        className,
      ),
    },
    children,
  );
}
