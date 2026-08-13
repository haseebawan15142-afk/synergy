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
 * Landing page hero videos — plays one after another with crossfade.
 * Run `npm run optimize:videos` after replacing source files.
 * Oversized WebM siblings were removed (MP4 is smaller); optional `webm` omitted.
 */
export const heroVideos: HeroVideo[] = [
  {
    label: "Landing clip 1",
    mp4: "/videos/hero/landing-01.mp4",
    poster: "/videos/hero/landing-01-poster.webp",
  },
  {
    label: "Landing clip 2",
    mp4: "/videos/hero/landing-02.mp4",
    poster: "/videos/hero/landing-02-poster.jpg",
  },
  {
    label: "Landing clip 3",
    mp4: "/videos/hero/landing-03.mp4",
    poster: "/videos/hero/landing-03-poster.webp",
  },
  {
    label: "Landing clip 4",
    mp4: "/videos/hero/landing-04.mp4",
    poster: "/videos/hero/landing-04-poster.webp",
  },
];

/** Primary poster for mobile / slow connections (first clip). */
export const heroFallbackPoster = heroVideos[0]?.poster ?? "/videos/hero/landing-01-poster.webp";

/** How long each hero clip stays visible before switching (ms) */
export const heroVideoIntervalMs = 8000;

/** Crossfade between hero clips (ms) */
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
      if (poster) row.poster = poster;
      if (webm) row.webm = webm;
      return row;
    })
    .filter((v) => Boolean(v.mp4))
    .slice(0, max);
}

/** CMS playlist when saved; otherwise bundled landing clips so the hero never goes blank. */
export function resolveLandingHeroVideos(videos?: HeroVideo[] | null): HeroVideo[] {
  const fromCms = normalizeLandingHeroVideos(videos);
  return fromCms.length ? fromCms : heroVideos;
}

export function landingHeroSlotsForAdmin(videos?: HeroVideo[] | null): HeroVideo[] {
  const source = normalizeLandingHeroVideos(videos);
  const seeded = source.length ? source : heroVideos;
  return seeded.map((clip, i) => ({
    mp4: clip.mp4 || "",
    poster: clip.poster || "",
    webm: clip.webm || "",
    label: clip.label || `Clip ${i + 1}`,
    durationSec: normalizeClipDurationSec(clip.durationSec, 8),
  }));
}
