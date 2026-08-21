/**
 * Strip solid white plates from client/partner logos into transparent folders.
 * Writes to public/images/client-logos and public/images/partner-logos
 * so the Next.js dev server lock on the originals does not block.
 *
 * Usage: node scripts/strip-logo-white-bg.mjs
 */
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const jobs = [
  {
    src: resolve(root, "public/images/clients"),
    dest: resolve(root, "public/images/client-logos"),
  },
  {
    src: resolve(root, "public/images/partners"),
    dest: resolve(root, "public/images/partner-logos"),
  },
];

const THRESH = 248;
const SOFT = 232;

async function processFile(srcPath, destPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  let nearWhite = 0;
  const total = width * height;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= THRESH && g >= THRESH && b >= THRESH) {
      data[i + 3] = 0;
      nearWhite += 1;
      continue;
    }
    if (r >= SOFT && g >= SOFT && b >= SOFT) {
      const t = (THRESH - Math.min(r, g, b)) / (THRESH - SOFT);
      data[i + 3] = Math.round(255 * Math.max(0, Math.min(1, t)));
      if (data[i + 3] < 40) nearWhite += 1;
    }
  }

  const pct = Math.round((100 * nearWhite) / total);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + 3];
      if (a < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX <= minX || maxY <= minY) {
    // Fall back: copy resized original with alpha attempt
    const buf = await sharp(srcPath)
      .ensureAlpha()
      .resize({ height: 160, fit: "inside" })
      .webp({ quality: 92 })
      .toBuffer();
    writeFileSync(destPath, buf);
    return { skipped: true, pct, file: basename(destPath) };
  }

  const pad = 10;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const targetH = 160;
  const scale = targetH / cropH;
  const targetW = Math.max(96, Math.round(cropW * scale));

  const buf = await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize({
      width: targetW,
      height: targetH,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, alphaQuality: 100 })
    .toBuffer();

  writeFileSync(destPath, buf);
  return { skipped: pct < 12, pct, file: basename(destPath), w: targetW, h: targetH };
}

let processed = 0;

for (const job of jobs) {
  if (!existsSync(job.src)) continue;
  mkdirSync(job.dest, { recursive: true });
  const files = readdirSync(job.src).filter((f) =>
    [".webp", ".png", ".jpg", ".jpeg"].includes(extname(f).toLowerCase()),
  );
  for (const file of files) {
    if (file.includes("placeholder") || file.includes(".tmp.")) continue;
    const outName = basename(file, extname(file)) + ".webp";
    const dest = join(job.dest, outName);
    try {
      const result = await processFile(join(job.src, file), dest);
      processed += 1;
      console.log("ok", result.file, `white~${result.pct}%`);
    } catch (err) {
      console.error("fail", file, err.message);
    }
  }
}

console.log(`Done. wrote ${processed} transparent logos`);
