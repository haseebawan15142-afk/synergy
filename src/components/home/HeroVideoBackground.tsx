"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  eventHeroVideoTransitionMs,
  heroFallbackPoster,
  heroVideoTransitionMs,
  clipDurationMs,
  resolveLandingHeroVideos,
  type HeroVideo,
} from "@/lib/content/hero-videos";
import { fetchActiveEventHeroVideos, fetchLandingHeroVideos } from "@/lib/cms/public";
import { getHeroPlaybackMode } from "@/lib/media/connection";
import { setHeroVideoActive } from "@/lib/media/hero-video-presence";

const HAVE_ENOUGH_DATA = 4;

export type EventHeroSeed = {
  presetId: string;
  videos: HeroVideo[];
};

type VideoLayerProps = {
  clipKey: string;
  mp4: string;
  webm?: string;
  poster?: string;
  visible: boolean;
  transitionMs: number;
  preload: "none" | "metadata" | "auto";
  onRef: (el: HTMLVideoElement | null) => void;
};

function VideoLayer({
  clipKey,
  mp4,
  webm,
  poster,
  visible,
  transitionMs,
  preload,
  onRef,
}: VideoLayerProps) {
  return (
    <video
      key={clipKey}
      ref={onRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover",
        "transition-opacity ease-in-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDuration: `${transitionMs}ms` }}
      muted
      loop
      playsInline
      preload={preload}
      poster={poster || undefined}
      aria-hidden
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

function waitForEnoughData(video: HTMLVideoElement, signal?: AbortSignal) {
  if (video.readyState >= HAVE_ENOUGH_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    let settled = false;

    const cleanup = () => {
      video.removeEventListener("canplaythrough", done);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", fail);
      signal?.removeEventListener("abort", onAbort);
    };

    const done = () => {
      if (settled) return;
      if (video.readyState < HAVE_ENOUGH_DATA) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onLoadedData = () => {
      if (video.readyState >= HAVE_ENOUGH_DATA) done();
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("video load failed"));
    };

    const onAbort = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    video.addEventListener("canplaythrough", done);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", fail, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });

    if (video.readyState >= HAVE_ENOUGH_DATA) {
      done();
    }
  });
}

function playlistKeyFor(isEvent: boolean, presetId: string, videos: HeroVideo[]) {
  const fingerprint = videos.map((v) => v.mp4).join("|");
  if (!isEvent) return `default-${fingerprint || "empty"}`;
  return `event-${presetId}-${fingerprint}`;
}

type HeroVideoBackgroundProps = {
  /** Server-fetched event clips — prevents default-playlist flash on Independence themes. */
  eventPlaylist?: EventHeroSeed | null;
  /** Server-fetched default landing clips when no event theme is active. */
  landingPlaylist?: { videos: HeroVideo[] } | null;
};

export function HeroVideoBackground({
  eventPlaylist = null,
  landingPlaylist = null,
}: HeroVideoBackgroundProps) {
  const seedKey =
    eventPlaylist?.videos?.length
      ? playlistKeyFor(true, eventPlaylist.presetId, eventPlaylist.videos)
      : landingPlaylist?.videos?.length
        ? playlistKeyFor(false, "default", landingPlaylist.videos)
        : "";
  const hasSeed = Boolean(seedKey);
  const seededVideos = eventPlaylist?.videos?.length
    ? eventPlaylist.videos
    : landingPlaylist?.videos?.length
      ? landingPlaylist.videos
      : [];
  const seededIsEvent = Boolean(eventPlaylist?.videos?.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const currentIndexRef = useRef(0);
  const switchingRef = useRef(false);

  const [mode, setMode] = useState<"pending" | "poster" | "video">("pending");
  const [playlistReady, setPlaylistReady] = useState(hasSeed);
  const [inView, setInView] = useState(false);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerIndices, setLayerIndices] = useState<[number, number]>([0, 1]);
  const [pendingIncoming, setPendingIncoming] = useState<0 | 1 | null>(null);
  const [playlist, setPlaylist] = useState<HeroVideo[]>(seededVideos);
  const [isEventPlaylist, setIsEventPlaylist] = useState(seededIsEvent);
  const [playlistKey, setPlaylistKey] = useState(seedKey || "loading");

  const transitionMs = isEventPlaylist ? eventHeroVideoTransitionMs : heroVideoTransitionMs;
  const fallbackDurationSec = isEventPlaylist ? 3 : 8;

  const applyPlaylist = useCallback((videos: HeroVideo[], isEvent: boolean, presetId = "default") => {
    setPlaylist(videos);
    setIsEventPlaylist(isEvent);
    setPlaylistKey(playlistKeyFor(isEvent, presetId, videos));
    setPlaylistReady(true);
  }, []);

  const loadPlaylist = useCallback(async () => {
    try {
      const active = await fetchActiveEventHeroVideos();
      if (active?.videos?.length) {
        applyPlaylist(active.videos, true, active.presetId);
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      const landing = await fetchLandingHeroVideos();
      applyPlaylist(resolveLandingHeroVideos(landing), false);
    } catch {
      applyPlaylist(resolveLandingHeroVideos(null), false);
    }
  }, [applyPlaylist]);

  useEffect(() => {
    setMode(getHeroPlaybackMode());
    // Seeded event playlist is already correct; still refresh on focus for admin updates.
    if (!hasSeed) {
      void loadPlaylist();
    }
    const onFocus = () => void loadPlaylist();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadPlaylist, hasSeed]);

  // Reset layers when playlist changes (e.g. theme activate)
  useEffect(() => {
    currentIndexRef.current = 0;
    visibleLayerRef.current = 0;
    switchingRef.current = false;
    setVisibleLayer(0);
    setLayerIndices([0, Math.min(1, Math.max(playlist.length - 1, 0))]);
    setPendingIncoming(null);
  }, [playlistKey, playlist.length]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mode !== "video" || !playlistReady) {
      setHeroVideoActive(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "50px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setHeroVideoActive(false);
    };
  }, [mode, playlistReady]);

  useEffect(() => {
    setHeroVideoActive(mode === "video" && inView && playlistReady);
  }, [mode, inView, playlistReady]);

  const playWhenReady = useCallback(async (layer: 0 | 1, signal?: AbortSignal) => {
    const video = videoRefs.current[layer];
    if (!video) return false;

    try {
      video.preload = "auto";
      await waitForEnoughData(video, signal);
      if (signal?.aborted) return false;

      video.currentTime = 0;
      await video.play();
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return false;
      return false;
    }
  }, []);

  useEffect(() => {
    if (mode !== "video" || !inView || !playlistReady) {
      for (const video of videoRefs.current) {
        video?.pause();
      }
      return;
    }

    if (pendingIncoming !== null || switchingRef.current) return;

    const controller = new AbortController();
    void playWhenReady(visibleLayerRef.current, controller.signal);
    return () => controller.abort();
  }, [mode, inView, pendingIncoming, playWhenReady, playlistKey, playlistReady]);

  useEffect(() => {
    if (pendingIncoming === null || mode !== "video" || !inView || !playlistReady) return;

    const incoming = pendingIncoming;
    const outgoing = (incoming === 0 ? 1 : 0) as 0 | 1;
    const controller = new AbortController();

    void (async () => {
      let attempts = 0;
      while (!videoRefs.current[incoming] && attempts < 30) {
        await new Promise((r) => window.requestAnimationFrame(r));
        attempts += 1;
      }

      const ready = await playWhenReady(incoming, controller.signal);
      if (!ready || controller.signal.aborted) {
        switchingRef.current = false;
        setPendingIncoming(null);
        return;
      }

      visibleLayerRef.current = incoming;
      setVisibleLayer(incoming);
      setPendingIncoming(null);

      window.setTimeout(() => {
        const out = videoRefs.current[outgoing];
        if (out && visibleLayerRef.current !== outgoing) {
          out.pause();
        }
        switchingRef.current = false;
      }, transitionMs + 40);
    })();

    return () => controller.abort();
  }, [pendingIncoming, mode, inView, layerIndices, playWhenReady, transitionMs, playlistReady]);

  useEffect(() => {
    if (mode !== "video" || !inView || !playlistReady || playlist.length <= 1) return;
    // Wait until a crossfade finishes before counting the new clip's duration.
    if (pendingIncoming !== null || switchingRef.current) return;

    const waitMs = clipDurationMs(playlist[currentIndexRef.current], fallbackDurationSec);
    const timer = window.setTimeout(() => {
      if (switchingRef.current) return;

      const next = (currentIndexRef.current + 1) % playlist.length;
      const outgoing = visibleLayerRef.current;
      const incoming = (outgoing === 0 ? 1 : 0) as 0 | 1;

      switchingRef.current = true;
      currentIndexRef.current = next;

      setLayerIndices((layers) => {
        const updated = [...layers] as [number, number];
        updated[incoming] = next;
        return updated;
      });
      setPendingIncoming(incoming);
    }, waitMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    mode,
    inView,
    playlist,
    fallbackDurationSec,
    playlistKey,
    playlistReady,
    pendingIncoming,
    visibleLayer,
  ]);

  const fallbackPoster = useMemo(() => {
    const first = playlist[0]?.poster?.trim();
    if (first) return first;
    if (isEventPlaylist) return "";
    return heroFallbackPoster;
  }, [playlist, isEventPlaylist]);

  const overlay = <div className="pointer-events-none absolute inset-0 bg-ink/55" aria-hidden />;

  if (mode === "pending" || !playlistReady) {
    return <div className="absolute inset-0 bg-ink" aria-hidden />;
  }

  if (mode === "poster") {
    return (
      <div className="absolute inset-0">
        {fallbackPoster ? (
          <Image
            src={fallbackPoster}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden
            unoptimized={fallbackPoster.startsWith("http")}
          />
        ) : (
          <div className="absolute inset-0 bg-ink" aria-hidden />
        )}
        {overlay}
      </div>
    );
  }

  const activeClip = playlist[layerIndices[visibleLayer]] ?? playlist[0];
  const layer0Clip = playlist[layerIndices[0]] ?? playlist[0];
  const layer1Clip = playlist[layerIndices[1]] ?? playlist[Math.min(1, playlist.length - 1)];

  if (!activeClip || !layer0Clip) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-ink" aria-hidden />
        {overlay}
      </div>
    );
  }

  const posterFor = (clip: HeroVideo) => {
    const p = clip.poster?.trim();
    if (p) return p;
    return isEventPlaylist ? undefined : heroFallbackPoster;
  };

  return (
    <div ref={containerRef} className="absolute inset-0" data-hero-playlist={playlistKey}>
      {posterFor(activeClip) ? (
        <Image
          src={posterFor(activeClip)!}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
          unoptimized={posterFor(activeClip)!.startsWith("http")}
        />
      ) : (
        <div className="absolute inset-0 bg-ink" aria-hidden />
      )}

      {inView ? (
        <>
          <VideoLayer
            clipKey={`l0-${playlistKey}-${layerIndices[0]}`}
            mp4={layer0Clip.mp4}
            webm={layer0Clip.webm}
            poster={posterFor(layer0Clip)}
            visible={visibleLayer === 0}
            transitionMs={transitionMs}
            preload={visibleLayer === 0 || pendingIncoming === 0 ? "auto" : "metadata"}
            onRef={(el) => {
              videoRefs.current[0] = el;
            }}
          />
          {layer1Clip ? (
            <VideoLayer
              clipKey={`l1-${playlistKey}-${layerIndices[1]}`}
              mp4={layer1Clip.mp4}
              webm={layer1Clip.webm}
              poster={posterFor(layer1Clip)}
              visible={visibleLayer === 1}
              transitionMs={transitionMs}
              preload={visibleLayer === 1 || pendingIncoming === 1 ? "auto" : "metadata"}
              onRef={(el) => {
                videoRefs.current[1] = el;
              }}
            />
          ) : null}
        </>
      ) : null}

      {overlay}
    </div>
  );
}
