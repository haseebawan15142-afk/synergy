"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type HeroExperienceLayerProps = {
  children: ReactNode;
  backdrop?: ReactNode;
  className?: string;
};

export function HeroExperienceLayer({ children, backdrop, className }: HeroExperienceLayerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width - 0.5) * 2;
      const py = (y / rect.height - 0.5) * 2;

      if (spotRef.current) {
        spotRef.current.style.setProperty("--spot-x", `${x}px`);
        spotRef.current.style.setProperty("--spot-y", `${y}px`);
      }

      if (contentRef.current) {
        contentRef.current.style.transform = `perspective(1400px) rotateX(${py * -2.5}deg) rotateY(${px * 3.5}deg) translateZ(0)`;
      }
    };

    const onLeave = () => {
      if (contentRef.current) {
        contentRef.current.style.transform =
          "perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      }
    };

    section.addEventListener("mousemove", onMove, { passive: true });
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <section ref={sectionRef} className={cn("relative overflow-hidden", className)}>
      {backdrop}
      {!reduce ? (
        <div ref={spotRef} className="hero-spotlight pointer-events-none absolute inset-0 z-[3]" aria-hidden />
      ) : null}
      <div
        ref={contentRef}
        className="relative z-10 transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
      >
        {children}
      </div>
    </section>
  );
}
