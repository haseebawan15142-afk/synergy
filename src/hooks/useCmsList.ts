"use client";

import { useEffect, useState } from "react";

/** Load a CMS list with a local fallback as the initial value (no flash of empty). */
export function useCmsList<T>(fallback: T[], loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>(fallback);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((next) => {
        // Only swap when CMS returns a usable non-empty list (avoids flicker to junk data).
        if (!cancelled && Array.isArray(next) && next.length > 0) {
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
