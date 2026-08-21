/** Client-side helpers for admin video uploads (any common format → web MP4). */

const VIDEO_EXT =
  /\.(mp4|webm|mov|m4v|avi|mkv|mpeg|mpg|wmv|flv|3gp|ogv|ogg|mts|m2ts|ts|vob|asf|f4v|hevc|h264|mxf|rm|rmvb|divx)$/i;

export function isAcceptableVideoUpload(file: File): boolean {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;
  if (mime.startsWith("image/") || mime === "application/pdf" || mime.startsWith("audio/")) {
    return false;
  }
  if (VIDEO_EXT.test(file.name)) return true;
  // Some OS pickers omit type/extension — allow convert to validate the bytes.
  if (!mime || mime === "application/octet-stream") return !/\.[a-z0-9]{1,8}$/i.test(file.name);
  return false;
}

export const ACCEPT_VIDEO_ATTR =
  "video/*,.mp4,.webm,.mov,.m4v,.avi,.mkv,.mpeg,.mpg,.wmv,.flv,.3gp,.ogv,.ogg,.mts,.m2ts,.ts,.vob,.asf,.f4v,.mxf,.rm,.rmvb";

/**
 * Send any video to the admin convert API → H.264 MP4 File for Storage upload.
 * Conversion is required for hero/web playback (faststart, scaled, no audio).
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
  if (!blob.size) {
    throw new Error("Convert returned an empty file");
  }
  const base = file.name.replace(/\.[^.]+$/, "") || "clip";
  options?.onProgress?.(90);
  return new File([blob], `${base}.mp4`, { type: "video/mp4" });
}
