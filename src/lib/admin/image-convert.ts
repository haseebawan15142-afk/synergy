/**
 * Browser-side image → WebP conversion before Firebase Storage upload.
 * SVG / non-images are returned unchanged.
 */

const MAX_EDGE = 1920;
const WEBP_QUALITY = 0.82;

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "image";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
}

/**
 * Convert raster images (JPEG/PNG/GIF/AVIF/…) to WebP via canvas.
 * Already-WebP files are returned as-is (optionally re-encoded if huge).
 */
export async function convertImageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml") return file;

  // Small existing WebP — keep as-is
  if (file.type === "image/webp" && file.size < 900_000) return file;

  if (typeof window === "undefined" || typeof createImageBitmap !== "function") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    let { width, height } = bitmap;
    if (width > MAX_EDGE || height > MAX_EDGE) {
      const scale = MAX_EDGE / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
    });

    if (!blob) return file;

    const webpName = `${safeFileName(baseName(file.name))}.webp`;
    return new File([blob], webpName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export function isConvertibleImage(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}
