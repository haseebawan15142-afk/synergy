"use client";

import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion/variants";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return children;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
