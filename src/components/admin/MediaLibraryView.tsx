"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import {
  deleteMedia,
  deleteUnusedMedia,
  formatBytes,
  listMediaLibrary,
  renameMedia,
  syncStorageToMediaIndex,
  uploadMediaFile,
  type MediaLibraryItem,
} from "@/lib/admin/media";
import { MEDIA_FOLDER_ALL, MEDIA_FOLDERS } from "@/lib/admin/types";
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
import { cn } from "@/lib/cn";

type UsageFilter = "all" | "used" | "unused";

export function MediaLibraryView() {
  const { user } = useAdminAuth();
  const [folder, setFolder] = useState<string>(MEDIA_FOLDER_ALL);
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MediaLibraryItem | null>(null);
  const [confirmPurgeUnused, setConfirmPurgeUnused] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMediaLibrary(folder));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleSync() {
    setSyncing(true);
    setSyncMessage("Starting…");
    try {
      const result = await syncStorageToMediaIndex({
        createdBy: user?.uid,
        onProgress: setSyncMessage,
      });
      toast.success(
        `Storage sync done — scanned ${result.scanned}, indexed ${result.created}, updated ${result.updated}`,
      );
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
      setSyncMessage("");
    }
  }

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    const targetFolder = folder === MEDIA_FOLDER_ALL ? "general" : folder;
    setUploading(true);
    try {
      for (const file of files) {
        setProgress(0);
        await uploadMediaFile(file, targetFolder, {
          createdBy: user?.uid,
          onProgress: setProgress,
        });
      }
      toast.success(`Uploaded ${files.length} file(s) to “${targetFolder}”`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (usageFilter === "used" && !i.used) return false;
      if (usageFilter === "unused" && i.used) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.path.toLowerCase().includes(q) ||
        i.folder.toLowerCase().includes(q)
      );
    });
  }, [items, search, usageFilter]);

  const unusedCount = items.filter((i) => !i.used).length;
  const usedCount = items.filter((i) => i.used).length;
  const totalBytes = items.reduce((sum, i) => sum + (i.size || 0), 0);

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Firebase Storage catalog by folder. “In use” includes CMS links and bundled site files (e.g. /images/blog). Only delete Unused after review — seeded site copies usually show In use."
        actions={
          <div className="flex flex-wrap gap-2">
            <SecondaryButton type="button" disabled={syncing || loading} onClick={() => void handleSync()}>
              <RefreshCw className={cn("mr-1 inline h-3.5 w-3.5", syncing && "animate-spin")} />
              {syncing ? "Syncing…" : "Sync from Storage"}
            </SecondaryButton>
            <SecondaryButton
              type="button"
              disabled={unusedCount === 0 || syncing}
              onClick={() => setConfirmPurgeUnused(true)}
            >
              <Trash2 className="mr-1 inline h-3.5 w-3.5" />
              Delete unused ({unusedCount})
            </SecondaryButton>
          </div>
        }
      />

      {syncMessage ? (
        <p className="mb-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-ink-muted">
          {syncMessage}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">In library</p>
          <p className="mt-1 text-2xl font-bold text-ink">{items.length}</p>
          <p className="text-xs text-ink-muted">{formatBytes(totalBytes)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">In use</p>
          <p className="mt-1 text-2xl font-bold text-synergy">{usedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Unused</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{unusedCount}</p>
          <p className="text-xs text-ink-muted">Not linked in CMS or site seeds</p>
        </Card>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[12rem_10rem_1fr]">
        <Field label="Folder">
          <select className={inputClass} value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value={MEDIA_FOLDER_ALL}>All folders</option>
            {MEDIA_FOLDERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Usage">
          <select
            className={inputClass}
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value as UsageFilter)}
          >
            <option value="all">All</option>
            <option value="used">Used only</option>
            <option value="unused">Unused only</option>
          </select>
        </Field>
        <Field label="Search">
          <input
            className={inputClass}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename, path, or folder"
          />
        </Field>
      </div>

      <MediaDropzone
        uploading={uploading}
        progress={progress}
        onFiles={handleFiles}
        accept="image/*,.webp,video/*,application/pdf"
        label="Drag & drop files here"
        hint={
          folder === MEDIA_FOLDER_ALL
            ? "Uploads go to “general” when All folders is selected — or pick a category first"
            : `Uploading into “${folder}” — images convert to WebP`
        }
      />

      <div className="mt-6">
        {loading ? (
          <AdminPageSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={items.length === 0 ? "Media library is empty" : "No matches"}
            description={
              items.length === 0
                ? "Click “Sync from Storage” to import every file already in Firebase Storage (partners, logos, blogs, etc.)."
                : "Try another folder or usage filter."
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <Card key={item.id || item.path} className="overflow-hidden p-0">
                <div className="relative">
                  {item.contentType?.startsWith("image/") ||
                  /\.(webp|png|jpe?g|gif|svg)(\?|$)/i.test(item.url || item.path) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="h-36 w-full bg-white object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-surface-muted text-sm text-ink-muted">
                      {item.contentType || "file"}
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    <span className="rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {item.folder}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                        item.used ? "bg-synergy" : "bg-amber-600",
                      )}
                    >
                      {item.used ? "In use" : "Unused"}
                    </span>
                  </div>
                </div>
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
                  <p className="truncate text-[11px] text-ink-muted" title={item.path}>
                    {item.path} · {formatBytes(item.size || 0)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <SecondaryButton
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.url);
                        toast.success("URL copied");
                      }}
                    >
                      <Copy className="mr-1 inline h-3.5 w-3.5" />
                      Copy
                    </SecondaryButton>
                    <SecondaryButton
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      title={item.used ? "This file is still referenced in CMS content" : "Safe to delete"}
                    >
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
        title={pendingDelete?.used ? "Delete media still in use?" : "Delete media?"}
        description={
          pendingDelete?.used
            ? "This file is still referenced by CMS content. Deleting it may break images on the site. Continues removes Storage + index."
            : "This removes the file from Firebase Storage and the media index. Unused files are safe to remove."
        }
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

      <ConfirmDialog
        open={confirmPurgeUnused}
        title={`Delete ${unusedCount} unused file(s)?`}
        description="Only files not referenced by Website Settings, Partners, Blogs, Clients, Offices, etc. will be removed from Storage. This frees space."
        confirmLabel="Delete unused"
        danger
        onCancel={() => setConfirmPurgeUnused(false)}
        onConfirm={async () => {
          try {
            const n = await deleteUnusedMedia(items);
            toast.success(`Deleted ${n} unused file(s)`);
            setConfirmPurgeUnused(false);
            await reload();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Bulk delete failed");
          }
        }}
      />
    </div>
  );
}
