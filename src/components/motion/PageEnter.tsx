"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

/** Soft enter animation when navigating between public pages. */
export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  const isHome = pathname === "/";

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: isHome ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDurations.reveal, ease: motionEase }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}
