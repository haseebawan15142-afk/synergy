"use client";

import { useReducedMotion } from "framer-motion";

export function PremiumBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="mesh-float absolute inset-0 opacity-90 dark:opacity-70" />
      {!reduce ? (
        <>
          <div className="aurora-blob aurora-blob-a" />
          <div className="aurora-blob aurora-blob-b" />
          <div className="aurora-blob aurora-blob-c" />
        </>
      ) : null}
    </div>
  );
}
