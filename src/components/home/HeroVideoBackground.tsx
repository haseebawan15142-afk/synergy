"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  heroFallbackPoster,
  heroVideoIntervalMs,
  heroVideoTransitionMs,
  heroVideos,
} from "@/lib/content/hero-videos";
import { getHeroPlaybackMode } from "@/lib/media/connection";
import { setHeroVideoActive } from "@/lib/media/hero-video-presence";

const HAVE_ENOUGH_DATA = 4;

type VideoLayerProps = {
  clipKey: string;
  mp4: string;
  webm?: string;
  poster: string;
  visible: boolean;
  preload: "none" | "metadata" | "auto";
  onRef: (el: HTMLVideoElement | null) => void;
};

function VideoLayer({ clipKey, mp4, webm, poster, visible, preload, onRef }: VideoLayerProps) {
  return (
    <video
      key={clipKey}
      ref={onRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover",
        "transition-opacity ease-in-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDuration: `${heroVideoTransitionMs}ms` }}
      muted
      loop
      playsInline
      preload={preload}
      poster={poster}
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

export function HeroVideoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const currentIndexRef = useRef(0);
  const switchingRef = useRef(false);

  const [mode, setMode] = useState<"pending" | "poster" | "video">("pending");
  const [inView, setInView] = useState(false);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerIndices, setLayerIndices] = useState<[number, number]>([0, 1]);
  const [pendingIncoming, setPendingIncoming] = useState<0 | 1 | null>(null);

  useEffect(() => {
    setMode(getHeroPlaybackMode());
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mode !== "video") {
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
  }, [mode]);

  useEffect(() => {
    setHeroVideoActive(mode === "video" && inView);
  }, [mode, inView]);

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

  // Initial / resume playback for the visible layer (skipped while a crossfade is in flight)
  useEffect(() => {
    if (mode !== "video" || !inView) {
      for (const video of videoRefs.current) {
        video?.pause();
      }
      return;
    }

    if (pendingIncoming !== null || switchingRef.current) return;

    const controller = new AbortController();
    void playWhenReady(visibleLayerRef.current, controller.signal);
    return () => controller.abort();
  }, [mode, inView, pendingIncoming, playWhenReady]);

  // Crossfade: only reveal the incoming layer once it has HAVE_ENOUGH_DATA
  useEffect(() => {
    if (pendingIncoming === null || mode !== "video" || !inView) return;

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
      }, heroVideoTransitionMs + 40);
    })();

    return () => controller.abort();
  }, [pendingIncoming, mode, inView, layerIndices, playWhenReady]);

  useEffect(() => {
    if (mode !== "video" || !inView || heroVideos.length <= 1) return;

    const timer = window.setInterval(() => {
      if (switchingRef.current) return;

      const next = (currentIndexRef.current + 1) % heroVideos.length;
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
    }, heroVideoIntervalMs);

    return () => {
      window.clearInterval(timer);
      switchingRef.current = false;
      setPendingIncoming(null);
    };
  }, [mode, inView]);

  const overlay = <div className="pointer-events-none absolute inset-0 bg-ink/55" aria-hidden />;

  if (mode === "pending") {
    return <div className="absolute inset-0 bg-ink" aria-hidden />;
  }

  if (mode === "poster") {
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

  const activeClip = heroVideos[layerIndices[visibleLayer]] ?? heroVideos[0];
  const layer0Clip = heroVideos[layerIndices[0]] ?? heroVideos[0];
  const layer1Clip = heroVideos[layerIndices[1]] ?? heroVideos[1];

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Image
        src={activeClip.poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />

      {inView ? (
        <>
          <VideoLayer
            clipKey={`l0-${layerIndices[0]}`}
            mp4={layer0Clip.mp4}
            webm={layer0Clip.webm}
            poster={layer0Clip.poster}
            visible={visibleLayer === 0}
            preload={visibleLayer === 0 || pendingIncoming === 0 ? "auto" : "metadata"}
            onRef={(el) => {
              videoRefs.current[0] = el;
            }}
          />
          <VideoLayer
            clipKey={`l1-${layerIndices[1]}`}
            mp4={layer1Clip.mp4}
            webm={layer1Clip.webm}
            poster={layer1Clip.poster}
            visible={visibleLayer === 1}
            preload={visibleLayer === 1 || pendingIncoming === 1 ? "auto" : "metadata"}
            onRef={(el) => {
              videoRefs.current[1] = el;
            }}
          />
        </>
      ) : null}

      {overlay}
    </div>
  );
}
