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

function clipSrcOnVideo(video: HTMLVideoElement) {
  return video.getAttribute("data-mp4") || "";
}

function assignClip(
  video: HTMLVideoElement,
  clip: HeroVideo,
  { play, restart = false }: { play: boolean; restart?: boolean },
) {
  const nextSrc = clip.mp4;
  if (!nextSrc) return;

  if (clipSrcOnVideo(video) === nextSrc) {
    if (restart) {
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    if (play) kickPlay(video);
    else video.pause();
    return;
  }

  video.setAttribute("data-mp4", nextSrc);
  if (clip.poster?.trim()) video.poster = clip.poster.trim();

  while (video.firstChild) video.removeChild(video.firstChild);
  if (clip.webm) {
    const webm = document.createElement("source");
    webm.src = clip.webm;
    webm.type = "video/webm";
    video.appendChild(webm);
  }
  const mp4 = document.createElement("source");
  mp4.src = nextSrc;
  mp4.type = "video/mp4";
  video.appendChild(mp4);
  video.load();
  if (play) kickPlay(video);
  else {
    const pauseWhenReady = () => video.pause();
    video.addEventListener("loadeddata", pauseWhenReady, { once: true });
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
  const playlistRef = useRef<HeroVideo[]>(seededVideos);
  const lastPlaylistKeyRef = useRef(seedKey || "loading");
  const unlockTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const modeRef = useRef<"poster" | "video">("poster");

  const [mode, setMode] = useState<"poster" | "video">("poster");
  const [playlistReady, setPlaylistReady] = useState(hasSeed || seededVideos.length > 0);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [playlist, setPlaylist] = useState<HeroVideo[]>(seededVideos);
  const [isEventPlaylist, setIsEventPlaylist] = useState(seededIsEvent);
  const [playlistKey, setPlaylistKey] = useState(seedKey || "loading");
  const [videoRevealed, setVideoRevealed] = useState(false);

  const transitionMs = isEventPlaylist ? eventHeroVideoTransitionMs : heroVideoTransitionMs;
  const fallbackDurationSec = isEventPlaylist ? 3 : 8;
  const multiClip = playlist.length > 1;
  const playOnceThenNext = multiClip && !isEventPlaylist;

  playlistRef.current = playlist;
  modeRef.current = mode;

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current != null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const unlockSwitch = useCallback(() => {
    if (unlockTimerRef.current != null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    switchingRef.current = false;
  }, []);

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

  const syncLayersFromIndex = useCallback((index: number, { playActive }: { playActive: boolean }) => {
    const list = playlistRef.current;
    if (!list.length) return;

    const active = list[index];
    const upcoming = list[(index + 1) % list.length];
    const activeLayer = visibleLayerRef.current;
    const idleLayer = (activeLayer === 0 ? 1 : 0) as 0 | 1;

    const activeEl = videoRefs.current[activeLayer];
    const idleEl = videoRefs.current[idleLayer];

    if (active?.mp4 && activeEl) {
      assignClip(activeEl, active, { play: playActive, restart: true });
    }
    if (list.length > 1 && upcoming?.mp4 && idleEl) {
      assignClip(idleEl, upcoming, { play: false });
    }
  }, []);

  const advanceToNext = useCallback(() => {
    const list = playlistRef.current;
    if (switchingRef.current || list.length <= 1) return;

    const next = (currentIndexRef.current + 1) % list.length;
    const outgoing = visibleLayerRef.current;
    const incoming = (outgoing === 0 ? 1 : 0) as 0 | 1;
    const nextClip = list[next];
    if (!nextClip?.mp4) return;

    switchingRef.current = true;
    clearAdvanceTimer();
    currentIndexRef.current = next;
    warmHeroVideo(nextClip.mp4);

    const incomingEl = videoRefs.current[incoming];
    if (incomingEl) {
      assignClip(incomingEl, nextClip, { play: true, restart: true });
    }

    visibleLayerRef.current = incoming;
    setVisibleLayer(incoming);
    setVideoRevealed(true);

    const afterNext = list[(next + 1) % list.length];

    if (unlockTimerRef.current != null) window.clearTimeout(unlockTimerRef.current);
    unlockTimerRef.current = window.setTimeout(() => {
      const out = videoRefs.current[outgoing];
      if (out && visibleLayerRef.current !== outgoing) {
        out.pause();
        if (afterNext?.mp4) assignClip(out, afterNext, { play: false });
      }
      unlockSwitch();
    }, transitionMs + 80);
  }, [clearAdvanceTimer, transitionMs, unlockSwitch]);

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
    unlockSwitch();
    clearAdvanceTimer();
    setVisibleLayer(0);
    // Wait a frame so both <video> nodes exist after playlist swaps.
    const id = window.requestAnimationFrame(() => {
      syncLayersFromIndex(0, { playActive: modeRef.current === "video" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [playlistKey, syncLayersFromIndex, clearAdvanceTimer, unlockSwitch]);

  useEffect(() => {
    setHeroVideoActive(mode === "video" && playlistReady);
    return () => setHeroVideoActive(false);
  }, [mode, playlistReady]);

  useEffect(() => {
    if (mode !== "video" || !playlistReady) return;
    const video = videoRefs.current[visibleLayerRef.current];
    kickPlay(video);
    const onPlaying = () => setVideoRevealed(true);
    video?.addEventListener("playing", onPlaying);
    video?.addEventListener("loadeddata", onPlaying);
    return () => {
      video?.removeEventListener("playing", onPlaying);
      video?.removeEventListener("loadeddata", onPlaying);
    };
  }, [mode, playlistReady, playlistKey, visibleLayer]);

  // Landing: play each clip fully once, then crossfade to the next.
  useEffect(() => {
    if (!playOnceThenNext || mode !== "video" || !playlistReady) return;

    const layer = visibleLayer;
    const video = videoRefs.current[layer];
    if (!video) return;

    let cancelled = false;
    let advanced = false;

    const goNext = () => {
      if (cancelled || advanced || switchingRef.current) return;
      if (visibleLayerRef.current !== layer) return;
      advanced = true;
      clearAdvanceTimer();
      advanceToNext();
    };

    const scheduleFromDuration = () => {
      if (cancelled || switchingRef.current || advanced) return;
      clearAdvanceTimer();

      const clip = playlistRef.current[currentIndexRef.current];
      const mediaMs =
        Number.isFinite(video.duration) && video.duration > 0 && video.duration !== Infinity
          ? video.duration * 1000
          : clipDurationMs(clip, fallbackDurationSec);

      const waitMs = Math.max(500, mediaMs - Math.min(transitionMs, 400));
      advanceTimerRef.current = window.setTimeout(goNext, waitMs);
    };

    const onEnded = () => goNext();
    const onTimeUpdate = () => {
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0 || d === Infinity) return;
      if (video.currentTime >= d - 0.25) goNext();
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", scheduleFromDuration);
    scheduleFromDuration();

    return () => {
      cancelled = true;
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", scheduleFromDuration);
      clearAdvanceTimer();
    };
  }, [
    playOnceThenNext,
    mode,
    playlistReady,
    playlistKey,
    visibleLayer,
    fallbackDurationSec,
    transitionMs,
    advanceToNext,
    clearAdvanceTimer,
  ]);

  // Event themes: fixed interval cuts.
  useEffect(() => {
    if (playOnceThenNext) return;
    if (mode !== "video" || !playlistReady || playlist.length <= 1) return;

    clearAdvanceTimer();
    const waitMs = clipDurationMs(
      playlistRef.current[currentIndexRef.current],
      fallbackDurationSec,
    );
    advanceTimerRef.current = window.setTimeout(() => {
      advanceToNext();
    }, waitMs);

    return () => clearAdvanceTimer();
  }, [
    playOnceThenNext,
    mode,
    playlist.length,
    fallbackDurationSec,
    playlistKey,
    playlistReady,
    visibleLayer,
    advanceToNext,
    clearAdvanceTimer,
  ]);

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      if (unlockTimerRef.current != null) window.clearTimeout(unlockTimerRef.current);
    };
  }, [clearAdvanceTimer]);

  // Stable refs — never re-assign sources on every React render.
  const setLayer0 = useCallback((el: HTMLVideoElement | null) => {
    videoRefs.current[0] = el;
    if (!el || modeRef.current !== "video") return;
    if (clipSrcOnVideo(el)) return;
    const list = playlistRef.current;
    const clip = list[visibleLayerRef.current === 0 ? currentIndexRef.current : (currentIndexRef.current + 1) % Math.max(list.length, 1)];
    if (clip?.mp4) {
      assignClip(el, clip, { play: visibleLayerRef.current === 0 });
    }
  }, []);

  const setLayer1 = useCallback((el: HTMLVideoElement | null) => {
    videoRefs.current[1] = el;
    if (!el || modeRef.current !== "video") return;
    if (clipSrcOnVideo(el)) return;
    const list = playlistRef.current;
    if (list.length < 2) return;
    const clip =
      list[
        visibleLayerRef.current === 1
          ? currentIndexRef.current
          : (currentIndexRef.current + 1) % list.length
      ];
    if (clip?.mp4) {
      assignClip(el, clip, { play: visibleLayerRef.current === 1 });
    }
  }, []);

  const fallbackPoster = useMemo(() => {
    const first = playlist[0]?.poster?.trim();
    if (first) return first;
    return heroFallbackPoster;
  }, [playlist]);

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
      </div>
    );
  }

  const activeClip = playlist[0];
  if (!activeClip) {
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
      </div>
    );
  }

  const posterSrc = activeClip.poster?.trim() || heroFallbackPoster;
  const loopSingle = !playOnceThenNext;

  return (
    <div className="absolute inset-0" data-hero-playlist={playlistKey}>
      <Image
        src={posterSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn(
          "object-cover transition-opacity duration-300",
          videoRevealed ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
        unoptimized={posterSrc.startsWith("http")}
      />

      <video
        ref={setLayer0}
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full object-cover",
          "brightness-[1.06] contrast-[1.05] saturate-[1.08]",
          "transition-opacity ease-in-out",
          visibleLayer === 0 && videoRevealed ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${transitionMs}ms` }}
        muted
        loop={loopSingle}
        playsInline
        autoPlay
        preload="auto"
        aria-hidden
      />
      {multiClip ? (
        <video
          ref={setLayer1}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover",
            "brightness-[1.06] contrast-[1.05] saturate-[1.08]",
            "transition-opacity ease-in-out",
            visibleLayer === 1 && videoRevealed ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${transitionMs}ms` }}
          muted
          loop={loopSingle}
          playsInline
          preload="auto"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
