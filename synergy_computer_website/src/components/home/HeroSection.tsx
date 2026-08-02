import { HeroBackgroundCarousel } from "@/components/home/HeroBackgroundCarousel";
import { HeroSectionContent } from "@/components/home/HeroSectionContent";
import { HeroExperienceLayer } from "@/components/effects/HeroExperienceLayer";

export function HeroSection() {
  return (
    <HeroExperienceLayer
      className="min-h-[min(100svh,820px)] border-b border-border/40 sm:min-h-[min(88vh,780px)]"
      backdrop={
        <>
          <div className="absolute inset-0 bg-grid-subtle opacity-40" aria-hidden />
          <HeroBackgroundCarousel />
          <div
            className="absolute inset-0 z-[2] bg-gradient-to-r from-ink/90 via-ink/75 to-ink/40 lg:to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-[2] bg-gradient-to-t from-ink/60 via-transparent to-transparent lg:hidden"
            aria-hidden
          />
        </>
      }
    >
      <HeroSectionContent />
    </HeroExperienceLayer>
  );
}
