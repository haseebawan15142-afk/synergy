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
  const poster = first?.poster?.trim() || heroFallbackPoster || null;

  return (
    <>
      <HeroVideoPreload mp4={first?.mp4} poster={poster} />
      <HeroExperienceLayer
        className="min-h-svh border-b border-border/40"
        backdrop={
          <>
            <HeroVideoBackground
              eventPlaylist={
                eventVideos
                  ? { presetId: event!.presetId, videos: eventVideos }
                  : null
              }
              landingPlaylist={eventVideos ? null : { videos: landingVideos }}
            />
            {/* Left-only text shade — no full musky wash over the video */}
            <div
              className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-black/50 via-black/15 to-transparent lg:from-black/40 lg:via-transparent"
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
