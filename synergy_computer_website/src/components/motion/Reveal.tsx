"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { revealVariants, type RevealVariant } from "@/lib/motion/variants";
import { viewportOnce } from "@/lib/motion/transitions";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={revealVariants[variant]}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
