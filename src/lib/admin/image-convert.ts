/**
 * Browser-side image normalization for Firebase Storage.
 * Rasters → WebP (best size/quality for Firebase + web).
 * SVG stays SVG (best for crisp icons).
 */

const MAX_EDGE_DEFAULT = 1920;
/** Nav / mega-menu icons stay sharp without huge files. */
const MAX_EDGE_ICON = 512;
const WEBP_QUALITY = 0.85;

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jfif: "image/jpeg",
  pjpeg: "image/jpeg",
  pjp: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  bmp: "image/bmp",
  dib: "image/bmp",
  ico: "image/x-icon",
  cur: "image/x-icon",
  tif: "image/tiff",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  heic: "image/heic",
  heif: "image/heif",
  apng: "image/apng",
};

/** Extensions we try to accept for admin image / icon uploads. */
export const ACCEPT_IMAGE_EXTENSIONS =
  ".jpg,.jpeg,.jfif,.png,.gif,.webp,.avif,.bmp,.ico,.tif,.tiff,.svg,.heic,.heif,.apng";

export const ACCEPT_IMAGE_ATTR = `image/*,${ACCEPT_IMAGE_EXTENSIONS}`;

function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "image";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
}

function extensionOf(name: string) {
  const m = /\.([^.]+)$/.exec(name.toLowerCase());
  return m?.[1] || "";
}

/** Infer MIME from filename when the browser leaves type empty / wrong. */
export function mimeFromFileName(name: string): string | undefined {
  return EXT_MIME[extensionOf(name)];
}

export function isSvgFile(file: File) {
  const type = (file.type || mimeFromFileName(file.name) || "").toLowerCase();
  return type === "image/svg+xml" || extensionOf(file.name) === "svg";
}

/** True for any image-like upload we should try (including empty MIME + known ext). */
export function isAcceptableImageUpload(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  if (type === "application/octet-stream" || !type) {
    return Boolean(mimeFromFileName(file.name));
  }
  // Some OS report ICO / SVG oddly
  if (type === "image/x-icon" || type === "image/vnd.microsoft.icon") return true;
  return Boolean(mimeFromFileName(file.name));
}

/** Ensure File has a usable image MIME before decode/upload. */
export function normalizeImageFile(file: File): File {
  const inferred = mimeFromFileName(file.name);
  if (!inferred) return file;
  if (file.type && file.type.startsWith("image/") && file.type !== "application/octet-stream") {
    return file;
  }
  return new File([file], file.name, {
    type: inferred,
    lastModified: file.lastModified,
  });
}

export function isConvertibleImage(file: File) {
  const normalized = normalizeImageFile(file);
  if (isSvgFile(normalized)) return false;
  return isAcceptableImageUpload(normalized);
}

async function rasterToWebp(file: File, maxEdge: number): Promise<File> {
  const source = normalizeImageFile(file);

  if (source.type === "image/webp" && source.size < 400_000) return source;

  if (typeof window === "undefined") return source;

  let bitmap: ImageBitmap | null = null;
  try {
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(source);
    }
  } catch {
    bitmap = null;
  }

  // Fallback: <img> decode (helps some BMP/ICO cases)
  if (!bitmap) {
    try {
      const url = URL.createObjectURL(source);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode failed"));
        el.src = url;
      });
      URL.revokeObjectURL(url);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (!width || !height) return source;

      if (width > maxEdge || height > maxEdge) {
        const scale = maxEdge / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return source;
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
      });
      if (!blob) return source;
      return new File([blob], `${safeFileName(baseName(source.name))}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });
    } catch {
      return source;
    }
  }

  try {
    let { width, height } = bitmap;
    if (width > maxEdge || height > maxEdge) {
      const scale = maxEdge / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
    });

    if (!blob) return source;

    return new File([blob], `${safeFileName(baseName(source.name))}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

/**
 * Convert raster images (JPEG/PNG/GIF/AVIF/BMP/ICO/…) to WebP via canvas.
 * SVG is returned unchanged. Already-small WebP kept as-is.
 */
export async function convertImageToWebp(file: File): Promise<File> {
  return convertImageForFirebase(file, { maxEdge: MAX_EDGE_DEFAULT });
}

/**
 * Firebase-ready image for Media Library / icons.
 * - SVG → keep SVG
 * - All other accepted rasters → WebP
 */
export async function convertImageForFirebase(
  file: File,
  options?: { maxEdge?: number; forIcon?: boolean },
): Promise<File> {
  const normalized = normalizeImageFile(file);
  if (!isAcceptableImageUpload(normalized)) return normalized;
  if (isSvgFile(normalized)) return normalized;

  const maxEdge =
    options?.maxEdge ?? (options?.forIcon || false ? MAX_EDGE_ICON : MAX_EDGE_DEFAULT);

  try {
    return await rasterToWebp(normalized, maxEdge);
  } catch {
    return normalized;
  }
}

/** Whether this upload should run through WebP conversion (not SVG). */
export function shouldConvertToWebp(file: File) {
  return isConvertibleImage(file);
}
