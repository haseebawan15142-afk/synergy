"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/admin/media";
import {
  ACCEPT_VIDEO_ATTR,
  convertVideoForFirebase,
  isAcceptableVideoUpload,
} from "@/lib/admin/video-convert";
import { extractPosterFromVideoFile } from "@/lib/admin/video-poster";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Field, SecondaryButton, inputClass } from "@/components/admin/ui";

export type VideoUrlChangeMeta = {
  posterUrl?: string;
};

function isAlreadyMp4(file: File): boolean {
  return file.type === "video/mp4" || /\.mp4$/i.test(file.name);
}

/** URL + library + video upload. MP4 goes straight to Firebase (works on Vercel). */
export function VideoUrlField({
  label,
  value,
  folder = "hero",
  onChange,
}: {
  label: string;
  value?: string;
  folder?: string;
  onChange: (url: string, meta?: VideoUrlChangeMeta) => void;
}) {
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"converting" | "poster" | "uploading" | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isAcceptableVideoUpload(file)) {
      toast.error("Please choose a video file (prefer MP4 for reliable upload)");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      let uploadFile = file;

      // Vercel serverless often cannot run ffmpeg / accept large convert bodies.
      // MP4 → upload directly to Firebase. Other formats → try convert, else ask for MP4.
      if (isAlreadyMp4(file)) {
        setPhase("uploading");
        setProgress(10);
        toast.message("Uploading MP4 to Firebase…");
      } else {
        setPhase("converting");
        try {
          uploadFile = await convertVideoForFirebase(file, {
            onProgress: (pct) => setProgress(Math.min(50, pct)),
          });
          toast.message("Converted to web MP4");
        } catch (convertErr) {
          const msg =
            convertErr instanceof Error ? convertErr.message : "Convert failed";
          toast.error(
            `${msg}. On Vercel, upload an MP4 file instead (conversion needs a local/dev server).`,
          );
          return;
        }
      }

      setPhase("poster");
      setProgress(55);
      let posterUrl: string | undefined;
      try {
        const posterFile = await extractPosterFromVideoFile(uploadFile);
        if (posterFile) {
          const posterAsset = await uploadMediaFile(posterFile, folder, {
            createdBy: user?.uid,
            onProgress: (pct) => setProgress(55 + Math.round(pct * 0.15)),
          });
          posterUrl = posterAsset.url;
        }
      } catch {
        /* poster optional */
      }

      setPhase("uploading");
      const asset = await uploadMediaFile(uploadFile, folder, {
        createdBy: user?.uid,
        onProgress: (pct) => setProgress(70 + Math.round(pct * 0.3)),
      });

      if (!asset.url) {
        toast.error("Upload finished but no URL returned");
        return;
      }

      onChange(asset.url, posterUrl ? { posterUrl } : undefined);
      toast.success(
        posterUrl
          ? "Video ready — URL filled. Click Save settings at the top."
          : "Video ready — URL filled. Click Save settings at the top.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setPhase(null);
      setProgress(0);
    }
  }

  const hasUrl = Boolean(String(value || "").trim());

  return (
    <div className="space-y-2">
      <Field label={label}>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Wait for upload — Firebase URL appears here"
            readOnly={uploading}
          />
          <SecondaryButton type="button" onClick={() => setOpen(true)} disabled={uploading}>
            Library
          </SecondaryButton>
        </div>
        {hasUrl ? (
          <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            Video URL set — now click Save settings
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
            Empty URL = nothing on the homepage after Save. Prefer MP4 upload.
          </p>
        )}
      </Field>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/40 px-3 py-4 text-center text-xs text-ink-muted transition hover:border-synergy/40">
        <input
          type="file"
          accept={ACCEPT_VIDEO_ATTR}
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {uploading
          ? phase === "converting"
            ? `Converting to MP4… ${progress}%`
            : phase === "poster"
              ? `Creating poster… ${progress}%`
              : `Uploading to Firebase… ${progress}%`
          : "Drop MP4 here (best on Vercel) — or other formats if convert works"}
      </label>
      <MediaPicker
        open={open}
        folder={folder}
        onClose={() => setOpen(false)}
        onSelect={(asset) => {
          onChange(asset.url);
          toast.success("Picked from library — click Save settings");
        }}
      />
    </div>
  );
}
