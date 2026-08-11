"use client";

import { useEffect } from "react";
import { fetchThemeTokens } from "@/lib/cms/public";
import { applyThemeTokensToRoot } from "@/lib/theme/apply-theme";

/** Applies CMS theme tokens as real design-token CSS variables on :root. */
export function CmsThemeStyles() {
  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      fetchThemeTokens()
        .then((theme) => {
          if (cancelled) return;
          applyThemeTokensToRoot(theme);
        })
        .catch(() => {
          /* keep design-token defaults */
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
