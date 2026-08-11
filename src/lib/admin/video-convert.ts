/** Client-side helpers for admin video uploads (any common format → MP4). */

const VIDEO_EXT =
  /\.(mp4|webm|mov|m4v|avi|mkv|mpeg|mpg|wmv|flv|3gp|ogv|mts|m2ts|ts|vob|asf|f4v)$/i;

export function isAcceptableVideoUpload(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return VIDEO_EXT.test(file.name);
}

export const ACCEPT_VIDEO_ATTR =
  "video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv,.mpeg,.mpg,.wmv,.flv,.3gp,.ogv,.mts,.m2ts";

/**
 * Send any video to the admin convert API → H.264 MP4 File for Storage upload.
 * Falls back to the original file if conversion is unavailable/fails.
 */
export async function convertVideoForFirebase(
  file: File,
  options?: { onProgress?: (pct: number) => void },
): Promise<File> {
  options?.onProgress?.(5);
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/admin/convert-video", {
    method: "POST",
    body,
    credentials: "same-origin",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err?.error === "string" ? err.error : `Video convert failed (${res.status})`,
    );
  }

  options?.onProgress?.(70);
  const blob = await res.blob();
  const base = file.name.replace(/\.[^.]+$/, "") || "clip";
  options?.onProgress?.(90);
  return new File([blob], `${base}.mp4`, { type: "video/mp4" });
}
