import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { HeroSectionContent } from "@/components/home/HeroSectionContent";
import { HeroExperienceLayer } from "@/components/effects/HeroExperienceLayer";
import { fetchActiveEventHeroVideos } from "@/lib/cms/public-server";

export async function HeroSection() {
  const event = await fetchActiveEventHeroVideos();

  return (
    <HeroExperienceLayer
      className="min-h-svh border-b border-border/40"
      backdrop={
        <>
          <div className="absolute inset-0 bg-grid-subtle opacity-20" aria-hidden />
          <HeroVideoBackground
            eventPlaylist={
              event?.videos?.length
                ? { presetId: event.presetId, videos: event.videos }
                : null
            }
          />
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
