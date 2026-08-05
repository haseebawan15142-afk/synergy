"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listMedia } from "@/lib/admin/media";
import type { MediaAsset } from "@/lib/admin/types";
import { MEDIA_FOLDERS } from "@/lib/admin/types";
import { Field, PrimaryButton, SecondaryButton, inputClass } from "@/components/admin/ui";

type MediaPickerProps = {
  open: boolean;
  folder?: string;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
};

export function MediaPicker({ open, folder, onClose, onSelect }: MediaPickerProps) {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [activeFolder, setActiveFolder] = useState(folder || "general");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMedia(activeFolder)
      .then(setItems)
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to load media"))
      .finally(() => setLoading(false));
  }, [open, activeFolder]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h2 className="font-semibold">Select media</h2>
          <SecondaryButton type="button" onClick={onClose}>
            Close
          </SecondaryButton>
        </div>
        <div className="border-b border-zinc-200 p-3 dark:border-zinc-700">
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
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-zinc-500">No files in this folder. Upload via Media Library.</p>
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
                  className="overflow-hidden rounded-xl border border-zinc-200 text-left hover:border-zinc-900 dark:border-zinc-700"
                >
                  {item.contentType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.alt || item.name} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-zinc-100 text-xs dark:bg-zinc-800">
                      File
                    </div>
                  )}
                  <p className="truncate px-2 py-1.5 text-xs">{item.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
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
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Field label={label}>
        <div className="flex gap-2">
          <input className={inputClass} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
          <SecondaryButton type="button" onClick={() => setOpen(true)}>
            Browse
          </SecondaryButton>
        </div>
      </Field>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="mt-2 h-20 rounded-lg border object-cover dark:border-zinc-700" />
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
