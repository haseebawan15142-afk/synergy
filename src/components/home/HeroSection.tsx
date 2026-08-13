import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { HeroVideoPreload } from "@/components/home/HeroVideoPreload";
import { HeroSectionContent } from "@/components/home/HeroSectionContent";
import { HeroExperienceLayer } from "@/components/effects/HeroExperienceLayer";
import {
  fetchActiveEventHeroVideos,
  fetchLandingHeroVideos,
} from "@/lib/cms/public-server";
import { heroFallbackPoster } from "@/lib/content/hero-videos";

export async function HeroSection() {
  const [event, landingVideos] = await Promise.all([
    fetchActiveEventHeroVideos(),
    fetchLandingHeroVideos(),
  ]);

  const eventVideos = event?.videos?.length ? event.videos : null;
  const first = eventVideos?.[0] || landingVideos[0];

  return (
    <>
      <HeroVideoPreload mp4={first?.mp4} poster={first?.poster || heroFallbackPoster} />
      <HeroExperienceLayer
        className="min-h-svh border-b border-border/40"
        backdrop={
          <>
            <div className="absolute inset-0 bg-grid-subtle opacity-20" aria-hidden />
            <HeroVideoBackground
              eventPlaylist={
                eventVideos
                  ? { presetId: event!.presetId, videos: eventVideos }
                  : null
              }
              landingPlaylist={eventVideos ? null : { videos: landingVideos }}
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
    </>
  );
}
