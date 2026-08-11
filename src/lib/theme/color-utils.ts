/** Small color helpers for CMS theme → design-token mapping. */

export type Rgb = { r: number; g: number; b: number };

export function parseHex(value: string): Rgb | null {
  const raw = String(value || "")
    .trim()
    .replace(/^#/, "");
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(raw)) return null;
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(hex, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function toChannels(rgb: Rgb): string {
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
}

export function hexToChannels(value: string): string | null {
  const rgb = parseHex(value);
  return rgb ? toChannels(rgb) : null;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** Mix toward white (amount 0–1). */
export function lighten(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: clamp(rgb.r + (255 - rgb.r) * amount),
    g: clamp(rgb.g + (255 - rgb.g) * amount),
    b: clamp(rgb.b + (255 - rgb.b) * amount),
  });
}

/** Mix toward black (amount 0–1). */
export function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  return rgbToHex({
    r: clamp(rgb.r * (1 - amount)),
    g: clamp(rgb.g * (1 - amount)),
    b: clamp(rgb.b * (1 - amount)),
  });
}

/** Soft tint suitable for muted backgrounds (mix heavily toward white). */
export function softTint(hex: string, amount = 0.88): string {
  return lighten(hex, amount);
}
