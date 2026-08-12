"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { fetchThemeTokens } from "@/lib/cms/public";
import type { ThemeTokens } from "@/lib/admin/types";
import { applyThemeTokensToRoot } from "@/lib/theme/apply-theme";

/** Applies CMS theme tokens as real design-token CSS variables on :root. */
export function CmsThemeStyles() {
  const { resolvedTheme } = useTheme();
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
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    applyThemeTokensToRoot(tokens, document.documentElement, { mode });
  }, [tokens, resolvedTheme]);

  return null;
}
