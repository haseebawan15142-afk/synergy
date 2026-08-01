export type HeroPlaybackMode = "poster" | "video";

/** Whether hero background video should play (vs static poster only). */
export function getHeroPlaybackMode(): HeroPlaybackMode {
  if (typeof window === "undefined") return "poster";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "poster";
  }

  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  const slowConnection =
    conn?.saveData === true ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "2g" ||
    conn?.effectiveType === "3g";

  if (mobile || slowConnection) {
    return "poster";
  }

  return "video";
}
