"use client";

import { useEffect, useState } from "react";
import type { ThemeTokens } from "@/lib/admin/types";
import { applyThemeTokensToRoot } from "@/lib/theme/apply-theme";
import { subscribeLiveThemeTokens } from "@/lib/cms/live-active-theme";

/**
 * Applies CMS brand theme tokens. Surface/ink stay mode-aware via CSS
 * (`html:not(.dark)`), so the navbar Dark toggle always works.
 * Live Firestore sync so Activate updates every open device quickly.
 */
export function CmsThemeStyles() {
  const [tokens, setTokens] = useState<Partial<ThemeTokens> | null>(null);

  useEffect(() => {
    return subscribeLiveThemeTokens((theme) => setTokens(theme));
  }, []);

  useEffect(() => {
    if (!tokens) return;
    applyThemeTokensToRoot(tokens);
  }, [tokens]);

  return null;
}
