"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMediaFile } from "@/lib/admin/media";
import {
  ACCEPT_VIDEO_ATTR,
  convertVideoForFirebase,
  isAcceptableVideoUpload,
} from "@/lib/admin/video-convert";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Field, SecondaryButton, inputClass } from "@/components/admin/ui";

/** URL + library + any-format video upload (converted to MP4 for web). */
export function VideoUrlField({
  label,
  value,
  folder = "hero",
  onChange,
}: {
  label: string;
  value?: string;
  folder?: string;
  onChange: (url: string) => void;
}) {
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"converting" | "uploading" | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isAcceptableVideoUpload(file)) {
      toast.error("Please choose a video file (MP4, MOV, WebM, AVI, MKV, …)");
      return;
    }
    setUploading(true);
    setProgress(0);
    setPhase("converting");
    try {
      let uploadFile = file;
      try {
        uploadFile = await convertVideoForFirebase(file, {
          onProgress: (pct) => setProgress(Math.min(60, pct)),
        });
        toast.message("Converted to MP4 for web");
      } catch (convertErr) {
        // Still try original bytes if already browser-playable
        if (file.type === "video/mp4" || file.type === "video/webm") {
          toast.message("Using original video (convert skipped)");
          uploadFile = file;
        } else {
          throw convertErr;
        }
      }

      setPhase("uploading");
      const asset = await uploadMediaFile(uploadFile, folder, {
        createdBy: user?.uid,
        onProgress: (pct) => setProgress(60 + Math.round(pct * 0.4)),
      });
      onChange(asset.url);
      toast.success("Video saved to Firebase");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setPhase(null);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-2">
      <Field label={label}>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Video URL or upload below"
            readOnly={uploading}
          />
          <SecondaryButton type="button" onClick={() => setOpen(true)} disabled={uploading}>
            Library
          </SecondaryButton>
        </div>
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
            : `Uploading… ${progress}%`
          : "Any video format → converts to MP4"}
      </label>
      <MediaPicker
        open={open}
        folder={folder}
        onClose={() => setOpen(false)}
        onSelect={(asset) => onChange(asset.url)}
      />
    </div>
  );
}
