"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { cardHover, cardRest } from "@/lib/motion/variants";
import { viewportOnce } from "@/lib/motion/transitions";
import { fadeUp } from "@/lib/motion/variants";

type MotionCardProps = {
  children: ReactNode;
  className?: string;
  reveal?: boolean;
};

/** GPU-friendly hover lift — wrap existing card root; keep inner layout/classes unchanged. */
export function MotionCard({ children, className, reveal = true }: MotionCardProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={reveal ? "hidden" : false}
      whileInView={reveal ? "visible" : undefined}
      viewport={reveal ? viewportOnce : undefined}
      variants={reveal ? fadeUp : undefined}
      whileHover={{
        ...cardHover,
        boxShadow: "0 20px 48px -12px rgb(124 58 237 / 0.32)",
      }}
      whileTap={{ scale: 0.995 }}
      animate={reveal ? undefined : cardRest}
      style={{ transformOrigin: "center center" }}
    >
      {children}
    </motion.div>
  );
}
