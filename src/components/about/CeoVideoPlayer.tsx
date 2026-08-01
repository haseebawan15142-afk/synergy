"use client";

import { ceoMessage } from "@/lib/content/ceo-message";

export function CeoVideoPlayer() {
  return (
    <video
      className="h-full w-full object-cover"
      controls
      playsInline
      preload="none"
      poster={ceoMessage.posterSrc}
      aria-label={`Video message from ${ceoMessage.name}`}
    >
      <source src={ceoMessage.videoSrc} type="video/mp4" />
      Your browser does not support embedded video.
    </video>
  );
}
