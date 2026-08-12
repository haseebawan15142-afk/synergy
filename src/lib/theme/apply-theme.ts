import type { ThemeTokens } from "@/lib/admin/types";
import {
  darken,
  hexToChannels,
  lighten,
  parseHex,
  softTint,
  toChannels,
} from "@/lib/theme/color-utils";

function toCmsVar(key: string) {
  return `--cms-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
}

function setHexAndChannels(
  root: CSSStyleDeclaration,
  hexVar: string,
  channelsVar: string | null,
  hex: string,
) {
  root.setProperty(hexVar, hex);
  if (channelsVar) {
    const channels = hexToChannels(hex);
    if (channels) root.setProperty(channelsVar, channels);
  }
}

/**
 * Semantic surface/ink/border vars that globals.css defines separately for
 * `:root` (light) and `.dark`. Inline styles from CMS would otherwise win
 * over `.dark { … }` and make the dark toggle look broken.
 */
const MODE_SENSITIVE_VARS = [
  "--color-surface",
  "--c-surface",
  "--color-surface-muted",
  "--c-surface-muted",
  "--color-surface-elevated",
  "--c-surface-elevated",
  "--color-canvas",
  "--color-ink",
  "--c-ink",
  "--color-ink-secondary",
  "--c-ink-secondary",
  "--color-ink-body",
  "--c-ink-body",
  "--color-ink-muted",
  "--c-ink-muted",
  "--color-border",
  "--c-border",
  "--color-border-strong",
  "--c-border-strong",
  "--color-synergy-muted",
  "--c-synergy-muted",
  "--color-accent-soft",
  "--c-accent-soft",
  "--shadow-soft",
  "--shadow-card",
] as const;

function clearModeSensitiveVars(root: CSSStyleDeclaration) {
  for (const name of MODE_SENSITIVE_VARS) {
    root.removeProperty(name);
  }
}

export type ApplyThemeMode = "light" | "dark";

function detectThemeMode(rootEl: HTMLElement): ApplyThemeMode {
  return rootEl.classList.contains("dark") ? "dark" : "light";
}

/**
 * Apply ThemeTokens to the live design-token CSS variables the site actually uses.
 * Also mirrors values to `--cms-*` for optional custom CSS.
 *
 * Brand hues always apply. Surface / text / border only apply in light mode so
 * next-themes `class="dark"` can use globals.css dark tokens.
 */
export function applyThemeTokensToRoot(
  theme: Partial<ThemeTokens>,
  rootEl: HTMLElement = document.documentElement,
  options?: { mode?: ApplyThemeMode },
) {
  const root = rootEl.style;
  const mode: ApplyThemeMode = options?.mode ?? detectThemeMode(rootEl);

  (Object.entries(theme) as [string, string | boolean | undefined][]).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      root.setProperty(toCmsVar(key), value);
    }
  });

  if (theme.primary) {
    setHexAndChannels(root, "--color-synergy", "--c-synergy-channels", theme.primary);
    const light = lighten(theme.primary, 0.35);
    root.setProperty("--color-synergy-light", light);
    if (mode === "light") {
      const muted = softTint(theme.primary, 0.88);
      root.setProperty("--color-synergy-muted", muted);
      const mutedRgb = parseHex(muted);
      if (mutedRgb) root.setProperty("--c-synergy-muted", toChannels(mutedRgb));
    }
  }

  if (theme.secondary) {
    setHexAndChannels(root, "--color-synergy-dark", "--c-synergy-dark-channels", theme.secondary);
  } else if (theme.primary) {
    const dark = darken(theme.primary, 0.18);
    setHexAndChannels(root, "--color-synergy-dark", "--c-synergy-dark-channels", dark);
  }

  if (theme.accent) {
    setHexAndChannels(root, "--color-accent", "--c-accent-channels", theme.accent);
    if (mode === "light") {
      const soft = softTint(theme.accent, 0.85);
      root.setProperty("--color-accent-soft", soft);
      const softRgb = parseHex(soft);
      if (softRgb) root.setProperty("--c-accent-soft", toChannels(softRgb));
    }
  }

  if (theme.buttonText) {
    root.setProperty("--color-on-synergy", theme.buttonText);
  }

  if (theme.buttonBg) {
    root.setProperty(toCmsVar("buttonBg"), theme.buttonBg);
  }

  if (mode === "dark") {
    clearModeSensitiveVars(root);
  } else {
    if (theme.background) {
      setHexAndChannels(root, "--color-surface", "--c-surface", theme.background);
      root.setProperty("--color-canvas", theme.background);
      const mutedRgb = parseHex(theme.background);
      if (mutedRgb) {
        const shifted = {
          r: Math.max(0, mutedRgb.r - 8),
          g: Math.max(0, mutedRgb.g - 6),
          b: Math.max(0, mutedRgb.b - 4),
        };
        root.setProperty(
          "--color-surface-muted",
          `#${[shifted.r, shifted.g, shifted.b]
            .map((n) => n.toString(16).padStart(2, "0"))
            .join("")}`,
        );
        root.setProperty("--c-surface-muted", toChannels(shifted));
      }
    }

    if (theme.surface) {
      setHexAndChannels(root, "--color-surface-elevated", "--c-surface-elevated", theme.surface);
    }

    if (theme.text) {
      setHexAndChannels(root, "--color-ink", "--c-ink", theme.text);
      const secondary = lighten(theme.text, 0.12);
      const body = lighten(theme.text, 0.22);
      setHexAndChannels(root, "--color-ink-secondary", "--c-ink-secondary", secondary);
      setHexAndChannels(root, "--color-ink-body", "--c-ink-body", body);
    }

    if (theme.textMuted) {
      setHexAndChannels(root, "--color-ink-muted", "--c-ink-muted", theme.textMuted);
    }

    if (theme.border) {
      setHexAndChannels(root, "--color-border", "--c-border", theme.border);
      const strong = darken(theme.border, 0.12);
      setHexAndChannels(root, "--color-border-strong", "--c-border-strong", strong);
    }

    if (theme.shadow) {
      root.setProperty("--shadow-soft", theme.shadow);
    }
  }

  if (theme.borderRadius) {
    root.setProperty("--radius-card", theme.borderRadius);
  }

  if (theme.fontFamily) {
    root.setProperty("--font-sans", theme.fontFamily);
  }

  if (theme.fontSizeBase) {
    root.setProperty("font-size", theme.fontSizeBase);
  }
}
