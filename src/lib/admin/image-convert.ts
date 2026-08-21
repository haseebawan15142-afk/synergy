/**
 * Browser-side image normalization for Firebase Storage.
 * Rasters → WebP (best size/quality for Firebase + web).
 * SVG stays SVG (best for crisp icons).
 * Logo uploads can strip solid backgrounds for transparent navbar marks.
 */

const MAX_EDGE_DEFAULT = 1920;
/** Nav / mega-menu icons stay sharp without huge files. */
const MAX_EDGE_ICON = 512;
/** Brand logos — wide wordmarks need more horizontal room than icons. */
const MAX_EDGE_LOGO = 1400;
const WEBP_QUALITY = 0.85;
/** Soft cut for solid-color backgrounds (0–255 color distance). */
const BG_REMOVE_THRESHOLD = 42;

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

function colorDistance(r: number, g: number, b: number, br: number, bg: number, bb: number) {
  const dr = r - br;
  const dg = g - bg;
  const db = b - bb;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Make a near-solid backdrop transparent.
 * Prefers true black/white plates (common logo exports) over a single noisy corner.
 * Optional: lift charcoal wordmarks so they read on dark glass headers.
 */
export function stripSolidBackgroundFromImageData(
  imageData: ImageData,
  options?: { liftDarkText?: boolean },
): ImageData {
  const { data, width, height } = imageData;
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]] as const;
  };

  // Edge samples — ignore outliers (e.g. green mark touching a corner).
  const edgePts: Array<readonly [number, number, number]> = [];
  const stepX = Math.max(1, Math.floor(width / 24));
  const stepY = Math.max(1, Math.floor(height / 12));
  for (let x = 0; x < width; x += stepX) {
    edgePts.push(sample(x, 1), sample(x, height - 2));
  }
  for (let y = 0; y < height; y += stepY) {
    edgePts.push(sample(1, y), sample(width - 2, y));
  }

  let nearBlack = 0;
  let nearWhite = 0;
  for (const [r, g, b] of edgePts) {
    const lum = (r + g + b) / 3;
    if (lum < 28) nearBlack += 1;
    if (lum > 230) nearWhite += 1;
  }

  let br: number;
  let bg: number;
  let bb: number;
  if (nearBlack >= edgePts.length * 0.35) {
    br = bg = bb = 0;
  } else if (nearWhite >= edgePts.length * 0.35) {
    br = bg = bb = 255;
  } else {
    const corners = [
      sample(2, 2),
      sample(width - 3, 2),
      sample(2, height - 3),
      sample(width - 3, height - 3),
    ];
    // Median-ish: drop extreme green/color outliers by picking darkest/lightest cluster
    const sorted = [...corners].sort(
      (a, c) => a[0] + a[1] + a[2] - (c[0] + c[1] + c[2]),
    );
    const pick = sorted[1] ?? sorted[0];
    br = pick[0];
    bg = pick[1];
    bb = pick[2];
  }

  const bgLum = (br + bg + bb) / 3;
  const threshold = bgLum < 40 ? 58 : bgLum > 220 ? 48 : BG_REMOVE_THRESHOLD;
  const soft = threshold * 0.4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = colorDistance(r, g, b, br, bg, bb);

    if (dist <= soft) {
      data[i + 3] = 0;
      continue;
    }
    if (dist < threshold) {
      const t = (dist - soft) / (threshold - soft);
      data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, t)));
    }

    if (!options?.liftDarkText || data[i + 3] < 12) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = (r + g + b) / 3;
    const greenish = g > r + 18 && g > b + 18;
    if (greenish || sat > 0.28) continue;
    if (bgLum > 80) continue;
    if (lum < 100) {
      data[i] = 248;
      data[i + 1] = 248;
      data[i + 2] = 248;
    } else if (lum < 175) {
      data[i] = Math.min(255, Math.round(r + 45));
      data[i + 1] = Math.min(255, Math.round(g + 45));
      data[i + 2] = Math.min(255, Math.round(b + 45));
    }
  }

  return imageData;
}

type RasterOptions = {
  maxEdge: number;
  removeBackground?: boolean;
  liftDarkText?: boolean;
};

async function decodeToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  try {
    if (typeof createImageBitmap === "function") {
      return await createImageBitmap(file);
    }
  } catch {
    /* fall through */
  }

  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    URL.revokeObjectURL(url);
    return img;
  } catch {
    return null;
  }
}

async function rasterToWebp(file: File, options: RasterOptions): Promise<File> {
  const source = normalizeImageFile(file);
  const { maxEdge, removeBackground, liftDarkText } = options;

  if (
    source.type === "image/webp" &&
    source.size < 400_000 &&
    !removeBackground
  ) {
    return source;
  }

  if (typeof window === "undefined") return source;

  const bitmap = await decodeToBitmap(source);
  if (!bitmap) return source;

  try {
    let width =
      "naturalWidth" in bitmap
        ? bitmap.naturalWidth || bitmap.width
        : bitmap.width;
    let height =
      "naturalHeight" in bitmap
        ? bitmap.naturalHeight || bitmap.height
        : bitmap.height;
    if (!width || !height) return source;

    if (width > maxEdge || height > maxEdge) {
      const scale = maxEdge / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return source;
    ctx.drawImage(bitmap, 0, 0, width, height);

    if (removeBackground) {
      const imageData = ctx.getImageData(0, 0, width, height);
      stripSolidBackgroundFromImageData(imageData, { liftDarkText });
      ctx.clearRect(0, 0, width, height);
      ctx.putImageData(imageData, 0, 0);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", WEBP_QUALITY);
    });
    if (!blob) return source;

    return new File([blob], `${safeFileName(baseName(source.name))}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    if ("close" in bitmap && typeof bitmap.close === "function") {
      bitmap.close();
    }
  }
}

/**
 * Convert raster images (JPEG/PNG/GIF/AVIF/BMP/ICO/…) to WebP via canvas.
 * SVG is returned unchanged. Already-small WebP kept as-is.
 */
export async function convertImageToWebp(file: File): Promise<File> {
  return convertImageForFirebase(file, { maxEdge: MAX_EDGE_DEFAULT });
}

export type ConvertImageOptions = {
  maxEdge?: number;
  forIcon?: boolean;
  /** Brand logos — wider max edge + optional bg strip. */
  forLogo?: boolean;
  /** Knock out solid plate (black/white) behind marks. */
  removeBackground?: boolean;
  /** Brighten charcoal wordmarks for dark glass headers. */
  liftDarkText?: boolean;
};

/**
 * Firebase-ready image for Media Library / icons / logos.
 * - SVG → keep SVG
 * - All other accepted rasters → WebP (alpha preserved when bg removed)
 */
export async function convertImageForFirebase(
  file: File,
  options?: ConvertImageOptions,
): Promise<File> {
  const normalized = normalizeImageFile(file);
  if (!isAcceptableImageUpload(normalized)) return normalized;
  if (isSvgFile(normalized)) return normalized;

  const forLogo = Boolean(options?.forLogo);
  const forIcon = Boolean(options?.forIcon) && !forLogo;
  const maxEdge =
    options?.maxEdge ??
    (forLogo ? MAX_EDGE_LOGO : forIcon ? MAX_EDGE_ICON : MAX_EDGE_DEFAULT);

  const removeBackground = Boolean(options?.removeBackground ?? forLogo);
  const liftDarkText = Boolean(options?.liftDarkText ?? forLogo);

  try {
    return await rasterToWebp(normalized, {
      maxEdge,
      removeBackground,
      liftDarkText,
    });
  } catch {
    return normalized;
  }
}

/** Whether this upload should run through WebP conversion (not SVG). */
export function shouldConvertToWebp(file: File) {
  return isConvertibleImage(file);
}
