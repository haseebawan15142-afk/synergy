export type HeroVideo = {
  mp4: string;
  webm?: string;
  poster?: string;
  label?: string;
  /** How long this clip stays on screen before the next (seconds). */
  durationSec?: number;
};

/** Admin-managed default landing playlist (event themes still override). */
export const MAX_LANDING_HERO_VIDEOS = 6;

/** Clamp admin duration to a sensible range. */
export function normalizeClipDurationSec(
  value: unknown,
  fallbackSec: number,
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallbackSec;
  return Math.min(60, Math.max(1, Math.round(n)));
}

export function clipDurationMs(
  clip: Pick<HeroVideo, "durationSec"> | null | undefined,
  fallbackSec: number,
): number {
  return normalizeClipDurationSec(clip?.durationSec, fallbackSec) * 1000;
}

/**
 * Reject legacy bundled public files. Hero playlist is Firebase/CMS only.
 */
export function isLegacyBundledHeroUrl(url: string): boolean {
  const v = String(url || "").trim().toLowerCase();
  if (!v) return false;
  if (/\/videos\/hero\/landing-0[1-4]/i.test(v)) return true;
  if (v.startsWith("/videos/hero/")) return true;
  return false;
}

/** True when the clip can play on the public site (remote CMS / Storage). */
export function isPlayableCmsHeroUrl(url: string): boolean {
  const v = String(url || "").trim();
  if (!v || isLegacyBundledHeroUrl(v)) return false;
  return (
    v.startsWith("https://") ||
    v.startsWith("http://") ||
    v.includes("firebasestorage") ||
    v.includes("storage.googleapis")
  );
}

/** No bundled playlist — empty until Admin → Website Settings saves clips. */
export const heroVideos: HeroVideo[] = [];

/**
 * No local poster file. Components use a CSS backdrop when CMS has no poster.
 * Kept as empty string so callers never preload a deleted public asset.
 */
export const heroFallbackPoster = "";

/** Fallback duration if a clip never fires `ended` (ms) — landing prefers full play-once. */
export const heroVideoIntervalMs = 8000;

/** Smooth crossfade between landing hero clips (ms) */
export const heroVideoTransitionMs = 1200;

/** Event-theme hero: switch every 3s with a smooth crossfade */
export const eventHeroVideoIntervalMs = 3000;
export const eventHeroVideoTransitionMs = 900;

export function emptyLandingHeroSlot(index: number): HeroVideo {
  return { mp4: "", poster: "", label: `Clip ${index + 1}`, durationSec: 8 };
}

export function normalizeLandingHeroVideos(
  videos: HeroVideo[] | null | undefined,
  max = MAX_LANDING_HERO_VIDEOS,
): HeroVideo[] {
  if (!Array.isArray(videos)) return [];
  return videos
    .map((v, i) => {
      const mp4 = String(v?.mp4 || "").trim();
      const poster = String(v?.poster || "").trim();
      const webm = String(v?.webm || "").trim();
      const label = String(v?.label || `Clip ${i + 1}`).trim();
      const durationSec = normalizeClipDurationSec(v?.durationSec, 8);
      const row: HeroVideo = { mp4, label, durationSec };
      if (poster && !isLegacyBundledHeroUrl(poster)) row.poster = poster;
      if (webm && isPlayableCmsHeroUrl(webm)) row.webm = webm;
      return row;
    })
    .filter((v) => isPlayableCmsHeroUrl(v.mp4))
    .slice(0, max);
}

/**
 * CMS playlist only. Empty = no hero video (CSS backdrop on the site).
 * Never re-injects deleted or local public/videos/hero clips.
 */
export function resolveLandingHeroVideos(videos?: HeroVideo[] | null): HeroVideo[] {
  return normalizeLandingHeroVideos(videos);
}

/** Admin editor slots — empty when CMS has no clips. */
export function landingHeroSlotsForAdmin(videos?: HeroVideo[] | null): HeroVideo[] {
  const source = normalizeLandingHeroVideos(videos);
  if (source.length) {
    return source.map((clip, i) => ({
      mp4: clip.mp4 || "",
      poster: clip.poster || "",
      webm: clip.webm || "",
      label: clip.label || `Clip ${i + 1}`,
      durationSec: normalizeClipDurationSec(clip.durationSec, 8),
    }));
  }
  return [{ ...emptyLandingHeroSlot(0) }];
}
