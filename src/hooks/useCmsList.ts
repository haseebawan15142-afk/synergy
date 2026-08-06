"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Show local fallback immediately for fast first paint, then swap to CMS
 * data when Firestore responds. Empty arrays from a successful CMS read are
 * respected (so admin deletes show on the site).
 */
export function useCmsList<T>(fallback: T[], loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>(fallback);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((next) => {
        if (cancelled) return;
        if (Array.isArray(next)) {
          setItems(next);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [loader]);

  return items;
}
