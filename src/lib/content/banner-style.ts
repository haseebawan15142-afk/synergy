/** Banner typography controlled from Admin → Theme presets. */

export const BANNER_FONT_SIZES = [
  { id: "sm", label: "Small", className: "text-xs sm:text-sm" },
  { id: "md", label: "Medium", className: "text-sm sm:text-base" },
  { id: "lg", label: "Large", className: "text-base sm:text-lg" },
  { id: "xl", label: "Extra large", className: "text-lg sm:text-xl" },
] as const;

export const BANNER_FONT_WEIGHTS = [
  { id: "normal", label: "Normal", className: "font-normal" },
  { id: "medium", label: "Medium", className: "font-medium" },
  { id: "semibold", label: "Semibold", className: "font-semibold" },
  { id: "bold", label: "Bold", className: "font-bold" },
] as const;

export const BANNER_FONT_STYLES = [
  { id: "normal", label: "Normal", className: "not-italic" },
  { id: "italic", label: "Italic", className: "italic" },
] as const;

export type BannerFontSize = (typeof BANNER_FONT_SIZES)[number]["id"];
export type BannerFontWeight = (typeof BANNER_FONT_WEIGHTS)[number]["id"];
export type BannerFontStyle = (typeof BANNER_FONT_STYLES)[number]["id"];

export type BannerTextStyle = {
  fontSize: BannerFontSize;
  fontWeight: BannerFontWeight;
  fontStyle: BannerFontStyle;
};

export const DEFAULT_BANNER_TEXT_STYLE: BannerTextStyle = {
  fontSize: "sm",
  fontWeight: "semibold",
  fontStyle: "normal",
};

/** Quick emoji picks for theme cards / banners (admin can still paste any emoji). */
export const THEME_EMOJI_SUGGESTIONS = [
  "🇵🇰",
  "🎉",
  "🌙",
  "✨",
  "🎄",
  "🪔",
  "🏢",
  "💚",
  "🚀",
  "⭐",
  "🎊",
  "🕌",
];

export function normalizeBannerTextStyle(
  input?: Partial<BannerTextStyle> | null,
): BannerTextStyle {
  const fontSize = BANNER_FONT_SIZES.some((x) => x.id === input?.fontSize)
    ? (input!.fontSize as BannerFontSize)
    : DEFAULT_BANNER_TEXT_STYLE.fontSize;
  const fontWeight = BANNER_FONT_WEIGHTS.some((x) => x.id === input?.fontWeight)
    ? (input!.fontWeight as BannerFontWeight)
    : DEFAULT_BANNER_TEXT_STYLE.fontWeight;
  const fontStyle = BANNER_FONT_STYLES.some((x) => x.id === input?.fontStyle)
    ? (input!.fontStyle as BannerFontStyle)
    : DEFAULT_BANNER_TEXT_STYLE.fontStyle;
  return { fontSize, fontWeight, fontStyle };
}

export function bannerTextStyleClassName(style?: Partial<BannerTextStyle> | null): string {
  const normalized = normalizeBannerTextStyle(style);
  const size = BANNER_FONT_SIZES.find((x) => x.id === normalized.fontSize)?.className || "";
  const weight =
    BANNER_FONT_WEIGHTS.find((x) => x.id === normalized.fontWeight)?.className || "";
  const fontStyle =
    BANNER_FONT_STYLES.find((x) => x.id === normalized.fontStyle)?.className || "";
  return [size, weight, fontStyle].filter(Boolean).join(" ");
}
