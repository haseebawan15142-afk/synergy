"use client";

import { createElement, type ElementType, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type PremiumTitleProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  shimmer?: boolean;
  variant?: "hero" | "section";
  id?: string;
};

const motionByTag = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  div: motion.div,
  span: motion.span,
} as const;

type MotionTag = keyof typeof motionByTag;

export function PremiumTitle({
  as: Tag = "h2",
  className,
  children,
  shimmer = true,
  variant = "section",
  id,
}: PremiumTitleProps) {
  const reduce = useReducedMotion();
  const classes = cn(
    "font-display tracking-tight",
    shimmer && !reduce && "heading-shimmer",
    className,
  );

  if (reduce) {
    return createElement(Tag, { id, className: classes }, children);
  }

  const tagKey = (typeof Tag === "string" ? Tag : "h2") as MotionTag;
  const MotionTag = motionByTag[tagKey] ?? motion.h2;
  const blurFrom = variant === "hero" ? "blur(16px)" : "blur(14px)";
  const yFrom = variant === "hero" ? 24 : 28;

  return (
    <MotionTag
      id={id}
      className={classes}
      initial={{ opacity: 0, filter: blurFrom, y: yFrom }}
      animate={variant === "hero" ? { opacity: 1, filter: "blur(0px)", y: 0 } : undefined}
      whileInView={variant === "section" ? { opacity: 1, filter: "blur(0px)", y: 0 } : undefined}
      viewport={variant === "section" ? { once: true, amount: 0.08, margin: "0px 0px -8% 0px" } : undefined}
      transition={{
        duration: 1.05,
        ease: [0.22, 1, 0.36, 1],
        delay: variant === "hero" ? 0.08 : 0,
      }}
    >
      {children}
    </MotionTag>
  );
}
