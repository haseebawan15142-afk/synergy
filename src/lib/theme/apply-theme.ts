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

/** Inline brand vars that are safe in both light and dark. */
const BRAND_INLINE_VARS = [
  "--color-synergy",
  "--c-synergy-channels",
  "--color-synergy-light",
  "--color-synergy-dark",
  "--c-synergy-dark-channels",
  "--color-accent",
  "--c-accent-channels",
  "--color-on-synergy",
  "--radius-card",
  "--font-sans",
] as const;

/**
 * Surface / ink / border must NOT be set as inline styles on <html> —
 * inline always beats `.dark { … }` and breaks the public dark toggle.
 * Light-only CMS overrides go into a dedicated stylesheet instead.
 */
const CMS_LIGHT_STYLE_ID = "synergy-cms-light-tokens";

function ensureCmsLightStyleEl(): HTMLStyleElement {
  let el = document.getElementById(CMS_LIGHT_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = CMS_LIGHT_STYLE_ID;
    document.head.appendChild(el);
  }
  return el;
}

function clearCmsLightStyle() {
  const el = document.getElementById(CMS_LIGHT_STYLE_ID);
  if (el) el.textContent = "";
}

function clearStaleModeSensitiveInline(root: CSSStyleDeclaration) {
  const stale = [
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
  ];
  for (const name of stale) root.removeProperty(name);
}

/**
 * Apply ThemeTokens to live CSS variables.
 * Brand hues → inline on <html> (both modes).
 * Surface/text/border → `html:not(.dark)` stylesheet only, so dark mode works.
 */
export function applyThemeTokensToRoot(
  theme: Partial<ThemeTokens>,
  rootEl: HTMLElement = document.documentElement,
) {
  const root = rootEl.style;

  // Drop any older inline surface/ink overrides from previous builds.
  clearStaleModeSensitiveInline(root);

  (Object.entries(theme) as [string, string | boolean | undefined][]).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      root.setProperty(toCmsVar(key), value);
    }
  });

  if (theme.primary) {
    setHexAndChannels(root, "--color-synergy", "--c-synergy-channels", theme.primary);
    root.setProperty("--color-synergy-light", lighten(theme.primary, 0.35));
  }

  if (theme.secondary) {
    setHexAndChannels(root, "--color-synergy-dark", "--c-synergy-dark-channels", theme.secondary);
  } else if (theme.primary) {
    setHexAndChannels(
      root,
      "--color-synergy-dark",
      "--c-synergy-dark-channels",
      darken(theme.primary, 0.18),
    );
  }

  if (theme.accent) {
    setHexAndChannels(root, "--color-accent", "--c-accent-channels", theme.accent);
  }

  if (theme.buttonText) {
    root.setProperty("--color-on-synergy", theme.buttonText);
  }

  if (theme.buttonBg) {
    root.setProperty(toCmsVar("buttonBg"), theme.buttonBg);
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

  // Light-mode-only semantic overrides (never applied under .dark).
  const lightRules: string[] = [];

  if (theme.primary) {
    const muted = softTint(theme.primary, 0.88);
    const mutedCh = hexToChannels(muted);
    lightRules.push(`--color-synergy-muted:${muted}`);
    if (mutedCh) lightRules.push(`--c-synergy-muted:${mutedCh}`);
  }

  if (theme.accent) {
    const soft = softTint(theme.accent, 0.85);
    const softCh = hexToChannels(soft);
    lightRules.push(`--color-accent-soft:${soft}`);
    if (softCh) lightRules.push(`--c-accent-soft:${softCh}`);
  }

  if (theme.background) {
    const bgCh = hexToChannels(theme.background);
    lightRules.push(`--color-surface:${theme.background}`);
    lightRules.push(`--color-canvas:${theme.background}`);
    if (bgCh) lightRules.push(`--c-surface:${bgCh}`);
    const mutedRgb = parseHex(theme.background);
    if (mutedRgb) {
      const shifted = {
        r: Math.max(0, mutedRgb.r - 8),
        g: Math.max(0, mutedRgb.g - 6),
        b: Math.max(0, mutedRgb.b - 4),
      };
      const mutedHex = `#${[shifted.r, shifted.g, shifted.b]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("")}`;
      lightRules.push(`--color-surface-muted:${mutedHex}`);
      lightRules.push(`--c-surface-muted:${toChannels(shifted)}`);
    }
  }

  if (theme.surface) {
    const ch = hexToChannels(theme.surface);
    lightRules.push(`--color-surface-elevated:${theme.surface}`);
    if (ch) lightRules.push(`--c-surface-elevated:${ch}`);
  }

  if (theme.text) {
    const inkCh = hexToChannels(theme.text);
    lightRules.push(`--color-ink:${theme.text}`);
    if (inkCh) lightRules.push(`--c-ink:${inkCh}`);
    const secondary = lighten(theme.text, 0.12);
    const body = lighten(theme.text, 0.22);
    const secCh = hexToChannels(secondary);
    const bodyCh = hexToChannels(body);
    lightRules.push(`--color-ink-secondary:${secondary}`);
    lightRules.push(`--color-ink-body:${body}`);
    if (secCh) lightRules.push(`--c-ink-secondary:${secCh}`);
    if (bodyCh) lightRules.push(`--c-ink-body:${bodyCh}`);
  }

  if (theme.textMuted) {
    const ch = hexToChannels(theme.textMuted);
    lightRules.push(`--color-ink-muted:${theme.textMuted}`);
    if (ch) lightRules.push(`--c-ink-muted:${ch}`);
  }

  if (theme.border) {
    const ch = hexToChannels(theme.border);
    lightRules.push(`--color-border:${theme.border}`);
    if (ch) lightRules.push(`--c-border:${ch}`);
    const strong = darken(theme.border, 0.12);
    const strongCh = hexToChannels(strong);
    lightRules.push(`--color-border-strong:${strong}`);
    if (strongCh) lightRules.push(`--c-border-strong:${strongCh}`);
  }

  if (theme.shadow) {
    lightRules.push(`--shadow-soft:${theme.shadow}`);
  }

  const styleEl = ensureCmsLightStyleEl();
  if (lightRules.length) {
    styleEl.textContent = `html:not(.dark){${lightRules.join(";")}}`;
  } else {
    clearCmsLightStyle();
  }

  void BRAND_INLINE_VARS;
}
