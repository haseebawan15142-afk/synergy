"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { invalidateCmsCache } from "@/lib/cms/cache";

/**
 * Show local fallback immediately for fast first paint, then swap to CMS
 * data when Firestore responds. Refetches on window focus so admin changes
 * appear without a full hard reload.
 */
export function useCmsList<T>(fallback: T[], loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>(fallback);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const load = useCallback(() => {
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

  useEffect(() => load(), [load]);

  useEffect(() => {
    const onFocus = () => {
      invalidateCmsCache();
      load();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        invalidateCmsCache();
        load();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  return items;
}
