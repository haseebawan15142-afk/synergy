import { heroSlidesGenerated } from "./hero-slides.generated";

export type HeroSlide = { src: string; alt: string };

/** Slides synced from `.cursor/images/` — run `npm run sync:hero` after adding images */
export const heroSlides: HeroSlide[] = [...heroSlidesGenerated];

/** Pause on each slide before sliding to the next (ms) */
export const heroCarouselMs = 5000;

/** Slide animation duration (ms) */
export const heroSlideTransitionMs = 800;
