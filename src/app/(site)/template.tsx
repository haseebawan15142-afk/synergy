"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Fast page enter — avoid long opacity-0 states that feel like loading. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return children;
  }

  return (
    <motion.div
      initial={{ opacity: 0.96 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
