"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listMedia, uploadMediaFile } from "@/lib/admin/media";
import type { MediaAsset } from "@/lib/admin/types";
import { MEDIA_FOLDERS } from "@/lib/admin/types";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { MediaDropzone } from "@/components/admin/MediaDropzone";
import { Field, PrimaryButton, SecondaryButton, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

type MediaPickerProps = {
  open: boolean;
  folder?: string;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
};

export function MediaPicker({ open, folder, onClose, onSelect }: MediaPickerProps) {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [activeFolder, setActiveFolder] = useState(folder || "general");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMedia(activeFolder));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    if (!open) return;
    setActiveFolder(folder || "general");
  }, [open, folder]);

  useEffect(() => {
    if (!open) return;
    void reload();
  }, [open, reload]);

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      let last: MediaAsset | null = null;
      for (const file of files) {
        setProgress(0);
        last = await uploadMediaFile(file, activeFolder, {
          createdBy: user?.uid,
          onProgress: setProgress,
        });
      }
      toast.success(`Uploaded ${files.length} file(s) to Firebase (WebP for images)`);
      await reload();
      if (last && files.length === 1) {
        onSelect(last);
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="font-semibold text-ink">Select or upload media</h2>
            <p className="text-xs text-ink-muted">Drag files in, browse your computer, or pick an existing asset.</p>
          </div>
          <SecondaryButton type="button" onClick={onClose}>
            Close
          </SecondaryButton>
        </div>

        <div className="space-y-4 border-b border-border p-4">
          <Field label="Folder">
            <select
              className={inputClass}
              value={activeFolder}
              onChange={(e) => setActiveFolder(e.target.value)}
            >
              {MEDIA_FOLDERS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <MediaDropzone
            compact
            multiple
            uploading={uploading}
            progress={progress}
            onFiles={handleFiles}
            accept="image/*,.webp,video/*,application/pdf"
            label="Drop images here"
            hint="PNG, JPG, WebP, or drag multiple files"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-ink-muted">No files in this folder yet — upload above to get started.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className={cn(
                    "overflow-hidden rounded-xl border border-border text-left transition",
                    "hover:border-synergy hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synergy",
                  )}
                >
                  {item.contentType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt || item.name} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-surface-muted text-xs text-ink-muted">
                      File
                    </div>
                  )}
                  <p className="truncate px-2 py-1.5 text-xs text-ink">{item.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <PrimaryButton type="button" onClick={onClose}>
            Done
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function MediaUrlField({
  label,
  value,
  folder,
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

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please choose an image file (JPG, PNG, etc.). It will be saved as WebP.");
      return;
    }
    setUploading(true);
    setPhase("converting");
    try {
      const asset = await uploadMediaFile(file, folder || "general", {
        createdBy: user?.uid,
        onProgress: setProgress,
        onPhase: setPhase,
      });
      onChange(asset.url);
      toast.success(
        asset.contentType === "image/webp"
          ? "Uploaded to Firebase as WebP"
          : "Uploaded to Firebase Storage",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(
        message.includes("storage/") || message.includes("unauthorized")
          ? "Upload blocked — check you are logged in as admin and Storage rules are deployed."
          : message,
      );
    } finally {
      setUploading(false);
      setPhase(null);
      setProgress(0);
    }
  }

  const isFirebaseUrl = Boolean(value && /firebasestorage\.googleapis\.com|storage\.googleapis\.com/.test(value));

  return (
    <div className="space-y-2">
      <Field label={label}>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Upload below — Firebase URL appears here"
            readOnly={uploading}
          />
          <SecondaryButton type="button" onClick={() => setOpen(true)} disabled={uploading}>
            Library
          </SecondaryButton>
        </div>
      </Field>

      <MediaDropzone
        compact
        multiple={false}
        uploading={uploading}
        progress={progress}
        onFiles={handleFiles}
        accept="image/*,.webp,.jpg,.jpeg,.png,.gif,.avif"
        label={
          phase === "converting"
            ? "Converting to WebP…"
            : phase === "uploading"
              ? "Uploading to Firebase…"
              : "Drop image here"
        }
        hint="JPG/PNG/etc. auto-convert to WebP, then save to Firebase Storage"
      />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-muted/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="mx-auto h-24 max-w-full object-contain" />
          <p className="mt-2 break-all text-center text-[11px] text-ink-muted">
            {isFirebaseUrl ? "Saved on Firebase Storage ✓" : "External / manual URL"}
          </p>
        </div>
      ) : null}

      <MediaPicker
        open={open}
        folder={folder}
        onClose={() => setOpen(false)}
        onSelect={(asset) => onChange(asset.url)}
      />
    </div>
  );
}
