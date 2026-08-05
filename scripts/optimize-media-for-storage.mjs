/**
 * Optimize public media for Firebase Storage + modern web.
 *
 * - JPG/JPEG → WebP (q≈85) when smaller
 * - PNG → keep if alpha; else WebP when smaller
 * - SVG unchanged
 * - Blog: keep WebP sources; remove unused .avif siblings (next/image encodes AVIF)
 * - Videos: skip re-encode (already optimized); drop .webm when larger than sibling .mp4
 * - Updates code/content references; writes reports/media-optimization-report.json
 *
 * Run: node scripts/optimize-media-for-storage.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const reportDir = path.join(root, "reports");
const WEBP_QUALITY = 85;
const MIN_SAVE_RATIO = 0.08; // require ≥8% smaller to convert

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

/** @type {Array<Record<string, unknown>>} */
const reportRows = [];
/** @type {string[]} */
const skipped = [];
/** @type {Map<string, string>} */
const pathReplacements = new Map(); // public URL old -> new

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function toPublicUrl(abs) {
  return "/" + path.relative(publicDir, abs).split(path.sep).join("/");
}

function kb(n) {
  return Math.round(n / 1024);
}

function pct(before, after) {
  if (!before) return 0;
  return Math.round(((before - after) / before) * 1000) / 10;
}

function storageKeyFromPublicUrl(url) {
  // Map /images/services/x.webp → services/x.webp etc.
  const clean = url.replace(/^\//, "");
  if (clean.startsWith("brand/")) return `logos/${clean.slice("brand/".length)}`;
  if (clean.startsWith("images/blog/")) return `blogs/${clean.slice("images/blog/".length)}`;
  if (clean.startsWith("images/leadership/")) return `leadership/${clean.slice("images/leadership/".length)}`;
  if (clean.startsWith("images/services/")) return `services/${clean.slice("images/services/".length)}`;
  if (clean.startsWith("images/case-studies/")) return `gallery/${clean.slice("images/case-studies/".length)}`;
  if (clean.startsWith("images/partners/")) return `clients/${clean.slice("images/partners/".length)}`;
  if (clean.startsWith("images/dynatrace/")) return `gallery/${clean.slice("images/dynatrace/".length)}`;
  if (clean.startsWith("images/careers/")) return `careers/${clean.slice("images/careers/".length)}`;
  if (clean.startsWith("videos/hero/")) return `hero/${clean.slice("videos/hero/".length)}`;
  if (clean.startsWith("videos/")) return `hero/${clean.slice("videos/".length)}`;
  return `general/${clean}`;
}

async function hasAlpha(filePath) {
  try {
    const meta = await sharp(filePath, { failOn: "none" }).metadata();
    return Boolean(meta.hasAlpha);
  } catch {
    return true; // treat as keep-safe if metadata fails
  }
}

async function encodeWebp(inputPath) {
  const input = fs.readFileSync(inputPath);
  return sharp(input, { failOn: "none" })
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer();
}

function replaceInFile(filePath, from, to) {
  if (!fs.existsSync(filePath)) return 0;
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.includes(from)) return 0;
  const next = text.split(from).join(to);
  fs.writeFileSync(filePath, next, "utf8");
  return (text.length - next.length) === 0 && from !== to
    ? 1
    : text.split(from).length - 1;
}

function updateAllReferences(oldUrl, newUrl) {
  if (oldUrl === newUrl) return 0;
  const targets = walk(path.join(root, "src")).concat(
    walk(path.join(root, "scripts")).filter((f) => f.endsWith(".mjs") || f.endsWith(".ts")),
  );
  let hits = 0;
  for (const file of targets) {
    if (!/\.(ts|tsx|js|jsx|mjs|css|md|json)$/i.test(file)) continue;
    hits += replaceInFile(file, oldUrl, newUrl);
  }
  // also firestore migrate data copies
  const migrateData = path.join(root, "scripts", "migrate-data");
  if (fs.existsSync(migrateData)) {
    for (const file of walk(migrateData)) {
      hits += replaceInFile(file, oldUrl, newUrl);
    }
  }
  pathReplacements.set(oldUrl, newUrl);
  return hits;
}

async function convertRaster(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const oldUrl = toPublicUrl(filePath);
  const before = fs.statSync(filePath).size;

  if (ext === ".svg") {
    skipped.push(`${oldUrl} — SVG kept unchanged`);
    reportRows.push({
      original: oldUrl,
      newFile: null,
      originalKB: kb(before),
      newKB: kb(before),
      reductionPct: 0,
      action: "keep-svg",
      refsUpdated: false,
      storageKey: storageKeyFromPublicUrl(oldUrl),
    });
    return;
  }

  if (ext === ".webp") {
    reportRows.push({
      original: oldUrl,
      newFile: oldUrl,
      originalKB: kb(before),
      newKB: kb(before),
      reductionPct: 0,
      action: "keep-webp",
      refsUpdated: false,
      storageKey: storageKeyFromPublicUrl(oldUrl),
    });
    return;
  }

  if (ext === ".avif") {
    // Blog AVIF siblings are unused when .webp exists and is the source of truth
    const webpSibling = filePath.replace(/\.avif$/i, ".webp");
    if (fs.existsSync(webpSibling) && filePath.includes(`${path.sep}blog${path.sep}`)) {
      fs.unlinkSync(filePath);
      reportRows.push({
        original: oldUrl,
        newFile: toPublicUrl(webpSibling),
        originalKB: kb(before),
        newKB: kb(fs.statSync(webpSibling).size),
        reductionPct: 100,
        action: "delete-unused-avif-sibling",
        refsUpdated: false,
        storageKey: storageKeyFromPublicUrl(toPublicUrl(webpSibling)),
      });
      return;
    }
    skipped.push(`${oldUrl} — AVIF kept (no webp sibling or not blog)`);
    return;
  }

  if (ext === ".gif") {
    skipped.push(`${oldUrl} — GIF skipped (animation risk)`);
    return;
  }

  if (ext === ".png") {
    try {
      if (await hasAlpha(filePath)) {
        skipped.push(`${oldUrl} — PNG kept (transparency required)`);
        reportRows.push({
          original: oldUrl,
          newFile: null,
          originalKB: kb(before),
          newKB: kb(before),
          reductionPct: 0,
          action: "keep-png-alpha",
          refsUpdated: false,
          storageKey: storageKeyFromPublicUrl(oldUrl),
        });
        return;
      }
    } catch (err) {
      skipped.push(`${oldUrl} — PNG kept (unreadable: ${err.message})`);
      return;
    }
  }

  if (![".jpg", ".jpeg", ".png"].includes(ext)) return;

  try {
    const webpBuf = await encodeWebp(filePath);
    const after = webpBuf.length;
    const saveRatio = (before - after) / before;
    if (after >= before || saveRatio < MIN_SAVE_RATIO) {
      skipped.push(
        `${oldUrl} — conversion skipped (WebP ${kb(after)}KB vs ${kb(before)}KB, save ${(saveRatio * 100).toFixed(1)}%)`,
      );
      reportRows.push({
        original: oldUrl,
        newFile: null,
        originalKB: kb(before),
        newKB: kb(before),
        reductionPct: 0,
        action: "skip-no-gain",
        refsUpdated: false,
        storageKey: storageKeyFromPublicUrl(oldUrl),
      });
      return;
    }

    const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
    const newUrl = toPublicUrl(webpPath);
    fs.writeFileSync(webpPath, webpBuf);

    // Prefer updating refs before deleting original
    const refs = updateAllReferences(oldUrl, newUrl);

    // Verify webp exists and is readable
    if (!fs.existsSync(webpPath) || fs.statSync(webpPath).size < 32) {
      skipped.push(`${oldUrl} — WebP write failed verification; original kept`);
      if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
      return;
    }

    fs.unlinkSync(filePath);

    reportRows.push({
      original: oldUrl,
      newFile: newUrl,
      originalKB: kb(before),
      newKB: kb(after),
      reductionPct: pct(before, after),
      action: "convert-webp",
      refsUpdated: refs > 0,
      refsCount: refs,
      storageKey: storageKeyFromPublicUrl(newUrl),
    });
  } catch (err) {
    skipped.push(`${oldUrl} — convert error: ${err.message}`);
  }
}

function optimizeVideos() {
  const videos = walk(path.join(publicDir, "videos")).filter((f) =>
    VIDEO_EXT.has(path.extname(f).toLowerCase()),
  );

  for (const file of videos) {
    const ext = path.extname(file).toLowerCase();
    const url = toPublicUrl(file);
    const size = fs.statSync(file).size;

    if (ext === ".webm") {
      const mp4 = file.replace(/\.webm$/i, ".mp4");
      if (fs.existsSync(mp4)) {
        const mp4Size = fs.statSync(mp4).size;
        if (size > mp4Size * 1.05) {
          // Larger WebM than MP4 — remove WebM; HTML sources fall back to MP4
          fs.unlinkSync(file);
          reportRows.push({
            original: url,
            newFile: toPublicUrl(mp4),
            originalKB: kb(size),
            newKB: kb(mp4Size),
            reductionPct: 100,
            action: "delete-oversized-webm",
            refsUpdated: false,
            note: "Kept MP4 sibling; browsers use MP4 fallback",
            storageKey: storageKeyFromPublicUrl(toPublicUrl(mp4)),
          });
          continue;
        }
      }
    }

    if (ext === ".mp4" || ext === ".webm") {
      reportRows.push({
        original: url,
        newFile: url,
        originalKB: kb(size),
        newKB: kb(size),
        reductionPct: 0,
        action: "keep-video-already-optimized",
        refsUpdated: false,
        storageKey: storageKeyFromPublicUrl(url),
      });
    } else if (ext === ".mov") {
      skipped.push(`${url} — MOV skipped (convert manually to MP4 if needed)`);
    }
  }
}

async function main() {
  console.log("Scanning and optimizing media…\n");

  const images = walk(publicDir).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));

  // Process AVIF deletions first, then conversions
  const avifs = images.filter((f) => path.extname(f).toLowerCase() === ".avif");
  const others = images.filter((f) => path.extname(f).toLowerCase() !== ".avif");

  for (const f of avifs) await convertRaster(f);
  for (const f of others) await convertRaster(f);

  optimizeVideos();

  // Also rewrite Firestore-migrated image paths in migrate-data services etc. already via updateAllReferences

  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const converted = reportRows.filter((r) => r.action === "convert-webp");
  const deletedAvif = reportRows.filter((r) => r.action === "delete-unused-avif-sibling");
  const deletedWebm = reportRows.filter((r) => r.action === "delete-oversized-webm");

  const bytesSavedEstimate =
    converted.reduce((s, r) => s + (r.originalKB - r.newKB) * 1024, 0) +
    deletedAvif.reduce((s, r) => s + r.originalKB * 1024, 0) +
    deletedWebm.reduce((s, r) => s + r.originalKB * 1024, 0);

  const report = {
    generatedAt: new Date().toISOString(),
    webpQuality: WEBP_QUALITY,
    minSaveRatio: MIN_SAVE_RATIO,
    summary: {
      rows: reportRows.length,
      convertedToWebp: converted.length,
      deletedUnusedAvif: deletedAvif.length,
      deletedOversizedWebm: deletedWebm.length,
      skipped: skipped.length,
      approxBytesSaved: bytesSavedEstimate,
      approxKBSaved: kb(bytesSavedEstimate),
      pathReplacements: Object.fromEntries(pathReplacements),
    },
    firebaseStorageLayout: {
      note: "Upload public assets using storageKey mapping; keep local public/ structure for Next.js.",
      folders: [
        "logos/",
        "blogs/",
        "leadership/",
        "services/",
        "gallery/",
        "events/",
        "careers/",
        "clients/",
        "testimonials/",
        "hero/",
        "seo/",
        "general/",
      ],
    },
    skipped,
    files: reportRows.sort((a, b) => String(a.original).localeCompare(String(b.original))),
  };

  const outJson = path.join(reportDir, "media-optimization-report.json");
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));

  // Human-readable markdown report (requested)
  const md = [
    "# Media optimization report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Converted to WebP: **${converted.length}**`,
    `- Removed unused blog AVIF siblings: **${deletedAvif.length}**`,
    `- Removed oversized WebM (MP4 kept): **${deletedWebm.length}**`,
    `- Skipped: **${skipped.length}**`,
    `- Approx space saved: **${report.summary.approxKBSaved} KB**`,
    "",
    "## Firebase Storage key mapping",
    "",
    "Local `public/` paths are preserved. When uploading to Firebase Storage, use `storageKey` from the JSON report (e.g. `/images/services/x.webp` → `services/x.webp`).",
    "",
    "## Converted files",
    "",
    "| Original | New | Before | After | Reduction | Refs updated |",
    "|---|---|---:|---:|---:|---|",
    ...converted.map(
      (r) =>
        `| \`${r.original}\` | \`${r.newFile}\` | ${r.originalKB} KB | ${r.newKB} KB | ${r.reductionPct}% | ${r.refsUpdated ? "yes" : "n/a"} |`,
    ),
    "",
    "## Skipped (with reason)",
    "",
    ...skipped.map((s) => `- ${s}`),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(reportDir, "media-optimization-report.md"), md);

  console.log(`Converted to WebP: ${converted.length}`);
  console.log(`Deleted unused AVIF: ${deletedAvif.length}`);
  console.log(`Deleted oversized WebM: ${deletedWebm.length}`);
  console.log(`Skipped: ${skipped.length}`);
  console.log(`Approx saved: ${report.summary.approxKBSaved} KB`);
  console.log(`Report: ${outJson}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
