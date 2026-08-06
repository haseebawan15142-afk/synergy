"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import { deleteMedia, listMedia, renameMedia, uploadMediaFile } from "@/lib/admin/media";
import { MEDIA_FOLDERS, type MediaAsset } from "@/lib/admin/types";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MediaDropzone } from "@/components/admin/MediaDropzone";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  Field,
  SecondaryButton,
  inputClass,
} from "@/components/admin/ui";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";

export function MediaLibraryView() {
  const { user } = useAdminAuth();
  const [folder, setFolder] = useState<string>("general");
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MediaAsset | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMedia(folder));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        setProgress(0);
        await uploadMediaFile(file, folder, {
          createdBy: user?.uid,
          onProgress: setProgress,
        });
      }
      toast.success(`Uploaded ${files.length} file(s)`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Drag & drop or browse files into Firebase Storage. Every module can pick from here."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[12rem_1fr]">
        <Field label="Folder">
          <select className={inputClass} value={folder} onChange={(e) => setFolder(e.target.value)}>
            {MEDIA_FOLDERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Search">
          <input
            className={inputClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename"
          />
        </Field>
      </div>

      <MediaDropzone
        uploading={uploading}
        progress={progress}
        onFiles={handleFiles}
        accept="image/*,.webp,video/*,application/pdf"
        label="Drag & drop files here"
        hint="or click Browse to select from your computer — images, WebP, video, PDF"
      />

      <div className="mt-6">
        {loading ? (
          <AdminPageSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No media yet"
            description="Upload images or videos into this folder to use them across the CMS."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <Card key={item.id} className="overflow-hidden p-0">
                {item.contentType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.alt || item.name} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-surface-muted text-sm text-ink-muted">
                    {item.contentType}
                  </div>
                )}
                <div className="space-y-2 p-3">
                  <input
                    className={inputClass}
                    defaultValue={item.name}
                    onBlur={async (e) => {
                      const name = e.target.value.trim();
                      if (!name || !item.id || name === item.name) return;
                      try {
                        await renameMedia(item.id, name);
                        toast.success("Renamed");
                        await reload();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Rename failed");
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <SecondaryButton
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.url);
                        toast.success("URL copied");
                      }}
                    >
                      <Copy className="mr-1 inline h-3.5 w-3.5" />
                      Copy URL
                    </SecondaryButton>
                    <SecondaryButton type="button" onClick={() => setPendingDelete(item)}>
                      <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                      Delete
                    </SecondaryButton>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete media?"
        description="This removes the file from Storage and the media index."
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteMedia(pendingDelete);
            toast.success("Deleted");
            setPendingDelete(null);
            await reload();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Delete failed");
          }
        }}
      />
    </div>
  );
}
