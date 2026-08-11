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
 * Apply ThemeTokens to the live design-token CSS variables the site actually uses.
 * Also mirrors values to `--cms-*` for optional custom CSS.
 */
export function applyThemeTokensToRoot(
  theme: Partial<ThemeTokens>,
  rootEl: HTMLElement = document.documentElement,
) {
  const root = rootEl.style;

  (Object.entries(theme) as [string, string | boolean | undefined][]).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      root.setProperty(toCmsVar(key), value);
    }
  });

  if (theme.primary) {
    setHexAndChannels(root, "--color-synergy", "--c-synergy-channels", theme.primary);
    const light = lighten(theme.primary, 0.35);
    const muted = softTint(theme.primary, 0.88);
    root.setProperty("--color-synergy-light", light);
    root.setProperty("--color-synergy-muted", muted);
    const mutedRgb = parseHex(muted);
    if (mutedRgb) root.setProperty("--c-synergy-muted", toChannels(mutedRgb));
  }

  if (theme.secondary) {
    setHexAndChannels(root, "--color-synergy-dark", "--c-synergy-dark-channels", theme.secondary);
  } else if (theme.primary) {
    const dark = darken(theme.primary, 0.18);
    setHexAndChannels(root, "--color-synergy-dark", "--c-synergy-dark-channels", dark);
  }

  if (theme.accent) {
    setHexAndChannels(root, "--color-accent", "--c-accent-channels", theme.accent);
    const soft = softTint(theme.accent, 0.85);
    root.setProperty("--color-accent-soft", soft);
    const softRgb = parseHex(soft);
    if (softRgb) root.setProperty("--c-accent-soft", toChannels(softRgb));
  }

  if (theme.buttonText) {
    root.setProperty("--color-on-synergy", theme.buttonText);
  }

  if (theme.buttonBg) {
    // Keep button aligned with primary when they match; still expose cms var.
    root.setProperty(toCmsVar("buttonBg"), theme.buttonBg);
  }

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

  if (theme.borderRadius) {
    root.setProperty("--radius-card", theme.borderRadius);
  }

  if (theme.shadow) {
    root.setProperty("--shadow-soft", theme.shadow);
  }

  if (theme.fontFamily) {
    root.setProperty("--font-sans", theme.fontFamily);
  }

  if (theme.fontSizeBase) {
    root.setProperty("font-size", theme.fontSizeBase);
  }
}
