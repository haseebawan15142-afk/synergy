"use client";

import { useEffect, useState } from "react";
import { fetchThemeTokens } from "@/lib/cms/public";
import type { ThemeTokens } from "@/lib/admin/types";
import { applyThemeTokensToRoot } from "@/lib/theme/apply-theme";

/**
 * Applies CMS brand theme tokens. Surface/ink stay mode-aware via CSS
 * (`html:not(.dark)`), so the navbar Dark toggle always works.
 */
export function CmsThemeStyles() {
  const [tokens, setTokens] = useState<Partial<ThemeTokens> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      fetchThemeTokens()
        .then((theme) => {
          if (!cancelled) setTokens(theme);
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

  useEffect(() => {
    if (!tokens) return;
    applyThemeTokensToRoot(tokens);
  }, [tokens]);

  return null;
}
