export type HeroVideo = {
  src: string;
  poster?: string;
  /** Optional label for the assets guide */
  label?: string;
};

/**
 * Landing page hero videos — plays one after another with crossfade.
 * Replace files in `public/videos/hero/` and update paths below.
 */
export const heroVideos: HeroVideo[] = [
  {
    label: "Landing clip 1 (from Downloads: 1992-153555258.mp4)",
    src: "/videos/hero/landing-01.mp4",
  },
  {
    label: "Landing clip 2 (from Downloads: 110923-689949643.mp4)",
    src: "/videos/hero/landing-02.mp4",
  },
  {
    label: "Landing clip 3 (from Downloads: 304598_medium.mp4)",
    src: "/videos/hero/landing-03.mp4",
  },
  {
    label: "Landing clip 4 (from Downloads: 192779-893446888_medium.mp4)",
    src: "/videos/hero/landing-04.mp4",
  },
];

/** How long each hero clip stays visible before switching (ms) */
export const heroVideoIntervalMs = 8000;

/** Crossfade between hero clips (ms) */
export const heroVideoTransitionMs = 1200;
