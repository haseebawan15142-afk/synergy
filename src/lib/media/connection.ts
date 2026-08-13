export type HeroPlaybackMode = "poster" | "video";

/** Whether hero background video should play (vs static poster only). */
export function getHeroPlaybackMode(): HeroPlaybackMode {
  if (typeof window === "undefined") return "poster";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "poster";
  }

  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;

  // Only bail out on explicitly constrained networks — mobile 4G/Wi‑Fi plays video.
  const slowConnection =
    conn?.saveData === true ||
    conn?.effectiveType === "slow-2g" ||
    conn?.effectiveType === "2g";

  if (slowConnection) {
    return "poster";
  }

  return "video";
}
