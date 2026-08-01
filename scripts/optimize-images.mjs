/**
 * Batch compress images in public/images/blog and public/images/hero.
 * Run: npm run optimize:images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  path.join(root, "public", "images", "blog"),
  path.join(root, "public", "images", "hero"),
];

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 78;
const WEBP_QUALITY = 78;
const PNG_QUALITY = 80;
const MAX_BYTES = 150 * 1024;

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function encodeToBuffer(filePath, ext) {
  const meta = await sharp(filePath, { failOn: "none" }).rotate().metadata();
  let pipeline = sharp(filePath, { failOn: "none" }).rotate();
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === ".webp") {
    return pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  }
  if (ext === ".png") {
    return pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toBuffer();
  }
  return pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
}

async function optimizeImage(filePath) {
  const before = fs.statSync(filePath).size;
  const ext = path.extname(filePath).toLowerCase();

  try {
    let buffer = await encodeToBuffer(filePath, ext);

    if (buffer.length > MAX_BYTES && (ext === ".jpg" || ext === ".jpeg" || ext === ".webp")) {
      let quality = ext === ".webp" ? WEBP_QUALITY : JPEG_QUALITY;
      while (buffer.length > MAX_BYTES && quality >= 55) {
        quality -= 5;
        let pipeline = sharp(filePath, { failOn: "none" }).rotate();
        buffer =
          ext === ".webp"
            ? await pipeline.webp({ quality, effort: 4 }).toBuffer()
            : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      }
    }

    fs.writeFileSync(filePath, buffer);
    const after = buffer.length;
    console.log(`  ${path.relative(root, filePath)}: ${kb(before)} → ${kb(after)}`);
    return { before, after };
  } catch (error) {
    console.warn(`  skip ${path.relative(root, filePath)}: ${error instanceof Error ? error.message : error}`);
    return { before, after: before };
  }
}

let totalBefore = 0;
let totalAfter = 0;
let count = 0;

for (const dir of targets) {
  const files = walk(dir);
  if (!files.length) {
    console.log(`[optimize-images] no images in ${path.relative(root, dir)}`);
    continue;
  }
  console.log(`\n[optimize-images] ${path.relative(root, dir)} (${files.length} files)`);
  for (const file of files) {
    const result = await optimizeImage(file);
    totalBefore += result.before;
    totalAfter += result.after;
    count += 1;
  }
}

console.log(
  `\n[optimize-images] ${count} files — ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB`,
);
