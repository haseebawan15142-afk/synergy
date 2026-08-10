import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { HeroSectionContent } from "@/components/home/HeroSectionContent";
import { HeroExperienceLayer } from "@/components/effects/HeroExperienceLayer";

export function HeroSection() {
  return (
    <HeroExperienceLayer
      className="min-h-svh border-b border-border/40"
      backdrop={
        <>
          <div className="absolute inset-0 bg-grid-subtle opacity-20" aria-hidden />
          <HeroVideoBackground />
          <div
            className="absolute inset-0 z-[2] bg-gradient-to-r from-ink/92 via-ink/78 to-ink/45 lg:to-ink/25"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-[2] bg-gradient-to-t from-ink/70 via-ink/20 to-transparent"
            aria-hidden
          />
        </>
      }
    >
      <HeroSectionContent />
    </HeroExperienceLayer>
  );
}
