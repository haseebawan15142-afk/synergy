"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

function useLiteEffects() {
  const reduce = useReducedMotion();
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const saveData = "connection" in navigator && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setLite(reduce || coarse || narrow || Boolean(saveData));
  }, [reduce]);

  return lite;
}

export function PremiumBackdrop() {
  const lite = useLiteEffects();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className={lite ? "absolute inset-0 opacity-90 dark:opacity-70" : "mesh-float absolute inset-0 opacity-90 dark:opacity-70"} />
      {!lite ? (
        <>
          <div className="aurora-blob aurora-blob-a hidden sm:block" />
          <div className="aurora-blob aurora-blob-b hidden md:block" />
          <div className="aurora-blob aurora-blob-c hidden lg:block" />
        </>
      ) : null}
    </div>
  );
}
