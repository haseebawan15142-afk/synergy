"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  eventHeroVideoTransitionMs,
  heroFallbackPoster,
  heroVideoTransitionMs,
  clipDurationMs,
  type HeroVideo,
} from "@/lib/content/hero-videos";
import { fetchLandingHeroVideos } from "@/lib/cms/public";
import { subscribeLiveHeroPlaylist } from "@/lib/cms/live-active-theme";
import { getHeroPlaybackMode } from "@/lib/media/connection";
import { warmHeroVideo } from "@/lib/media/hero-warm";
import { setHeroVideoActive } from "@/lib/media/hero-video-presence";

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
  onRef: (el: HTMLVideoElement | null) => void;
};

function VideoLayer({
  clipKey,
  mp4,
  webm,
  poster,
  visible,
  transitionMs,
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
      autoPlay
      preload="auto"
      poster={poster || undefined}
      aria-hidden
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

function playlistKeyFor(isEvent: boolean, presetId: string, videos: HeroVideo[]) {
  const fingerprint = videos
    .map((v) => `${v.mp4}@${v.durationSec ?? ""}@${v.poster || ""}`)
    .join("|");
  if (!isEvent) return `default-${fingerprint || "empty"}`;
  return `event-${presetId}-${fingerprint}`;
}

function kickPlay(video: HTMLVideoElement | null) {
  if (!video) return;
  video.muted = true;
  video.playsInline = true;
  const attempt = () => {
    const p = video.play();
    if (p) void p.catch(() => undefined);
  };
  attempt();
  if (video.readyState < 2) {
    video.addEventListener("loadeddata", attempt, { once: true });
    video.addEventListener("canplay", attempt, { once: true });
  }
}

type HeroVideoBackgroundProps = {
  eventPlaylist?: EventHeroSeed | null;
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

  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const currentIndexRef = useRef(0);
  const switchingRef = useRef(false);
  const lastPlaylistKeyRef = useRef(seedKey || "loading");

  // Poster first paint (instant). Upgrade to video in layout effect — no black "pending" frame.
  const [mode, setMode] = useState<"poster" | "video">("poster");
  const [playlistReady, setPlaylistReady] = useState(hasSeed || seededVideos.length > 0);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerIndices, setLayerIndices] = useState<[number, number]>([0, 1]);
  const [pendingIncoming, setPendingIncoming] = useState<0 | 1 | null>(null);
  const [playlist, setPlaylist] = useState<HeroVideo[]>(seededVideos);
  const [isEventPlaylist, setIsEventPlaylist] = useState(seededIsEvent);
  const [playlistKey, setPlaylistKey] = useState(seedKey || "loading");
  const [videoRevealed, setVideoRevealed] = useState(false);

  const transitionMs = isEventPlaylist ? eventHeroVideoTransitionMs : heroVideoTransitionMs;
  const fallbackDurationSec = isEventPlaylist ? 3 : 8;

  const applyPlaylist = useCallback((videos: HeroVideo[], isEvent: boolean, presetId = "default") => {
    const nextKey = playlistKeyFor(isEvent, presetId, videos);
    if (lastPlaylistKeyRef.current !== nextKey) {
      lastPlaylistKeyRef.current = nextKey;
      setPlaylist(videos);
      setIsEventPlaylist(isEvent);
      setPlaylistKey(nextKey);
      setVideoRevealed(false);
    }
    setPlaylistReady(Boolean(videos.length));
    for (const clip of videos.slice(0, 2)) {
      if (clip.mp4) warmHeroVideo(clip.mp4);
    }
  }, []);

  useLayoutEffect(() => {
    setMode(getHeroPlaybackMode());
  }, []);

  useEffect(() => {
    const unsub = subscribeLiveHeroPlaylist(
      (live) => {
        applyPlaylist(live.videos, live.isEvent, live.presetId);
      },
      () => fetchLandingHeroVideos(),
    );
    return unsub;
  }, [applyPlaylist]);

  useEffect(() => {
    currentIndexRef.current = 0;
    visibleLayerRef.current = 0;
    switchingRef.current = false;
    setVisibleLayer(0);
    setLayerIndices([0, Math.min(1, Math.max(playlist.length - 1, 0))]);
    setPendingIncoming(null);
  }, [playlistKey, playlist.length]);

  useEffect(() => {
    setHeroVideoActive(mode === "video" && playlistReady);
    return () => setHeroVideoActive(false);
  }, [mode, playlistReady]);

  // Mounted → play immediately (hero is always above the fold — no IntersectionObserver gate).
  useEffect(() => {
    if (mode !== "video" || !playlistReady) return;
    if (pendingIncoming !== null || switchingRef.current) return;

    const layer = visibleLayerRef.current;
    const video = videoRefs.current[layer];
    kickPlay(video);

    const onPlaying = () => setVideoRevealed(true);
    video?.addEventListener("playing", onPlaying);
    // Reveal as soon as we have a frame — don't wait for deep buffer.
    video?.addEventListener("loadeddata", onPlaying);

    return () => {
      video?.removeEventListener("playing", onPlaying);
      video?.removeEventListener("loadeddata", onPlaying);
    };
  }, [mode, playlistReady, playlistKey, pendingIncoming, visibleLayer]);

  useEffect(() => {
    if (pendingIncoming === null || mode !== "video" || !playlistReady) return;

    const incoming = pendingIncoming;
    const outgoing = (incoming === 0 ? 1 : 0) as 0 | 1;

    let cancelled = false;
    void (async () => {
      let attempts = 0;
      while (!videoRefs.current[incoming] && attempts < 40) {
        await new Promise((r) => window.requestAnimationFrame(r));
        attempts += 1;
      }
      if (cancelled) return;

      kickPlay(videoRefs.current[incoming]);
      visibleLayerRef.current = incoming;
      setVisibleLayer(incoming);
      setPendingIncoming(null);
      setVideoRevealed(true);

      window.setTimeout(() => {
        const out = videoRefs.current[outgoing];
        if (out && visibleLayerRef.current !== outgoing) out.pause();
        switchingRef.current = false;
      }, transitionMs + 40);
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingIncoming, mode, layerIndices, transitionMs, playlistReady]);

  useEffect(() => {
    if (mode !== "video" || !playlistReady || playlist.length <= 1) return;
    if (pendingIncoming !== null || switchingRef.current) return;

    const waitMs = clipDurationMs(playlist[currentIndexRef.current], fallbackDurationSec);
    const timer = window.setTimeout(() => {
      if (switchingRef.current) return;

      const next = (currentIndexRef.current + 1) % playlist.length;
      const outgoing = visibleLayerRef.current;
      const incoming = (outgoing === 0 ? 1 : 0) as 0 | 1;

      switchingRef.current = true;
      currentIndexRef.current = next;

      const nextClip = playlist[next];
      if (nextClip?.mp4) warmHeroVideo(nextClip.mp4);

      setLayerIndices((layers) => {
        const updated = [...layers] as [number, number];
        updated[incoming] = next;
        return updated;
      });
      setPendingIncoming(incoming);
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [
    mode,
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
    // Always have an instant paint surface (same as default landing) while remote bytes arrive.
    return heroFallbackPoster;
  }, [playlist]);

  const overlay = <div className="pointer-events-none absolute inset-0 bg-ink/55" aria-hidden />;

  if (!playlistReady && !playlist.length) {
    return (
      <div className="absolute inset-0">
        <Image
          src={heroFallbackPoster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        {overlay}
      </div>
    );
  }

  if (mode === "poster") {
    return (
      <div className="absolute inset-0">
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
        <Image
          src={heroFallbackPoster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        {overlay}
      </div>
    );
  }

  const posterFor = (clip: HeroVideo) => {
    const p = clip.poster?.trim();
    if (p) return p;
    return heroFallbackPoster;
  };

  return (
    <div className="absolute inset-0" data-hero-playlist={playlistKey}>
      <Image
        src={posterFor(activeClip)}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-300",
          videoRevealed ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
        unoptimized={posterFor(activeClip).startsWith("http")}
      />

      <VideoLayer
        clipKey={`l0-${playlistKey}-${layerIndices[0]}`}
        mp4={layer0Clip.mp4}
        webm={layer0Clip.webm}
        poster={posterFor(layer0Clip)}
        visible={visibleLayer === 0 && videoRevealed}
        transitionMs={transitionMs}
        onRef={(el) => {
          videoRefs.current[0] = el;
          if (el && visibleLayerRef.current === 0) kickPlay(el);
        }}
      />
      {layer1Clip ? (
        <VideoLayer
          clipKey={`l1-${playlistKey}-${layerIndices[1]}`}
          mp4={layer1Clip.mp4}
          webm={layer1Clip.webm}
          poster={posterFor(layer1Clip)}
          visible={visibleLayer === 1 && videoRevealed}
          transitionMs={transitionMs}
          onRef={(el) => {
            videoRefs.current[1] = el;
            if (el && (visibleLayerRef.current === 1 || pendingIncoming === 1)) kickPlay(el);
          }}
        />
      ) : null}

      {overlay}
    </div>
  );
}
