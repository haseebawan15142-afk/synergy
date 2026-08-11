export type HeroVideo = {
  mp4: string;
  webm?: string;
  poster?: string;
  label?: string;
};

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
