"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { subscribeHeroVideoActive } from "@/lib/media/hero-video-presence";

function useLiteEffects() {
  const reduce = useReducedMotion();
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const saveData =
      "connection" in navigator &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setLite(reduce || coarse || narrow || Boolean(saveData));
  }, [reduce]);

  return lite;
}

export function PremiumBackdrop() {
  const lite = useLiteEffects();
  const [heroVideoActive, setHeroVideoActive] = useState(false);

  useEffect(() => subscribeHeroVideoActive(setHeroVideoActive), []);

  // Fully unmount aurora while hero video is on-screen — never co-decode with video + blur.
  const showAurora = !lite && !heroVideoActive;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className={
          lite || heroVideoActive
            ? "absolute inset-0 opacity-90 dark:opacity-70"
            : "mesh-float absolute inset-0 opacity-90 dark:opacity-70"
        }
      />
      {showAurora ? (
        <>
          <div className="aurora-blob aurora-blob-a" />
          <div className="aurora-blob aurora-blob-b" />
          <div className="aurora-blob aurora-blob-c" />
        </>
      ) : null}
    </div>
  );
}
