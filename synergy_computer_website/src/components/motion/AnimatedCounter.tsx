"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: string;
  className?: string;
  duration?: number;
};

function parseStat(value: string): { prefix: string; target: number; suffix: string } | null {
  const match = value.match(/^(\D*)(\d+)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], target: Number(match[2]), suffix: match[3] };
}

export function AnimatedCounter({ value, className, duration = 1.4 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" });
  const reduce = useReducedMotion();
  const finishedRef = useRef(false);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    finishedRef.current = false;
    setDisplay(value);
  }, [value]);

  useEffect(() => {
    const parsed = parseStat(value);
    if (!parsed || reduce) return;
    if (!inView || finishedRef.current) return;

    const { prefix, target, suffix } = parsed;
    let start: number | null = null;
    let frame = 0;
    let cancelled = false;

    const step = (ts: number) => {
      if (cancelled) return;
      if (start === null) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(`${prefix}${Math.round(target * eased)}${suffix}`);
      if (p < 1) {
        frame = requestAnimationFrame(step);
      } else {
        finishedRef.current = true;
        setDisplay(value);
      }
    };

    frame = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [duration, inView, reduce, value]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}
