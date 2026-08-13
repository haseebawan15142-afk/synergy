"use client";

import { MediaUrlField } from "@/components/admin/MediaPicker";
import { VideoUrlField } from "@/components/admin/VideoUrlField";
import { Field, inputClass } from "@/components/admin/ui";
import {
  MAX_LANDING_HERO_VIDEOS,
  emptyLandingHeroSlot,
  normalizeClipDurationSec,
  type HeroVideo,
} from "@/lib/content/hero-videos";

type HeroVideoSlotsEditorProps = {
  videos: HeroVideo[];
  onChange: (videos: HeroVideo[]) => void;
  folder?: string;
  max?: number;
  /** Default seconds when a clip has no duration set (event themes use 3, landing uses 8). */
  defaultDurationSec?: number;
};

export function HeroVideoSlotsEditor({
  videos,
  onChange,
  folder = "hero",
  max = MAX_LANDING_HERO_VIDEOS,
  defaultDurationSec = 8,
}: HeroVideoSlotsEditorProps) {
  function patch(index: number, next: Partial<HeroVideo>) {
    onChange(videos.map((clip, i) => (i === index ? { ...clip, ...next } : clip)));
  }

  return (
    <div className="space-y-4">
      {videos.map((clip, index) => (
        <div
          key={`hero-slot-${index}`}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Clip {index + 1}
            </p>
            <button
              type="button"
              onClick={() => onChange(videos.filter((_, i) => i !== index))}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <Field label="Display length (seconds) — how long this clip plays">
            <input
              type="number"
              min={1}
              max={60}
              step={1}
              className={inputClass}
              value={normalizeClipDurationSec(clip.durationSec, defaultDurationSec)}
              onChange={(e) =>
                patch(index, {
                  durationSec: normalizeClipDurationSec(e.target.value, defaultDurationSec),
                })
              }
            />
            <p className="mt-1 text-[11px] text-zinc-500">1–60 seconds before switching to the next clip.</p>
          </Field>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <VideoUrlField
              label="Video"
              folder={folder}
              value={clip.mp4}
              onChange={(url) => patch(index, { mp4: url })}
            />
            <MediaUrlField
              label="Poster image (optional)"
              folder={folder}
              value={clip.poster}
              onChange={(url) => patch(index, { poster: url })}
            />
          </div>
        </div>
      ))}

      {videos.length < max ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...videos,
              { ...emptyLandingHeroSlot(videos.length), durationSec: defaultDurationSec },
            ])
          }
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Add clip
        </button>
      ) : null}
    </div>
  );
}
