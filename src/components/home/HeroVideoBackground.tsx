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

export function HeroVideoBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);
  const visibleLayerRef = useRef<0 | 1>(0);
  const currentIndexRef = useRef(0);

  const [mode, setMode] = useState<"pending" | "poster" | "video">("pending");
  const [inView, setInView] = useState(false);
  const [visibleLayer, setVisibleLayer] = useState<0 | 1>(0);
  const [layerIndices, setLayerIndices] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    setMode(getHeroPlaybackMode());
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mode !== "video") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "50px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  const playLayer = useCallback(async (layer: 0 | 1) => {
    const video = videoRefs.current[layer];
    if (!video) return;
    video.currentTime = 0;
    try {
      await video.play();
    } catch {
      /* autoplay blocked */
    }
  }, []);

  useEffect(() => {
    if (mode !== "video" || !inView) return;
    void playLayer(visibleLayer);
  }, [mode, inView, visibleLayer, layerIndices, playLayer]);

  useEffect(() => {
    if (mode !== "video" || !inView || heroVideos.length <= 1) return;

    const timer = window.setInterval(() => {
      const next = (currentIndexRef.current + 1) % heroVideos.length;
      const inactiveLayer = (visibleLayerRef.current === 0 ? 1 : 0) as 0 | 1;

      currentIndexRef.current = next;

      setLayerIndices((layers) => {
        const updated = [...layers] as [number, number];
        updated[inactiveLayer] = next;
        return updated;
      });

      void playLayer(inactiveLayer).then(() => {
        visibleLayerRef.current = inactiveLayer;
        setVisibleLayer(inactiveLayer);
      });
    }, heroVideoIntervalMs);

    return () => window.clearInterval(timer);
  }, [mode, inView, playLayer]);

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
            preload={visibleLayer === 0 ? "auto" : "none"}
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
            preload={visibleLayer === 1 ? "metadata" : "none"}
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
