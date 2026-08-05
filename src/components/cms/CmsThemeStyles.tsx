"use client";

import { useEffect } from "react";
import { fetchThemeTokens } from "@/lib/cms/public";

function toCssVar(key: string) {
  return `--cms-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
}

/** Applies CMS theme tokens as CSS variables on :root without redesigning the site. */
export function CmsThemeStyles() {
  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      fetchThemeTokens()
        .then((theme) => {
          if (cancelled) return;
          const root = document.documentElement;
          (Object.entries(theme) as [string, string | boolean][]).forEach(([key, value]) => {
            if (typeof value === "string") {
              root.style.setProperty(toCssVar(key), value);
            }
          });
          if (theme.primary) {
            root.style.setProperty("--color-synergy", theme.primary);
          }
          if (theme.accent) {
            root.style.setProperty("--color-accent", theme.accent);
          }
        })
        .catch(() => {
          /* keep design-token defaults */
        });
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
