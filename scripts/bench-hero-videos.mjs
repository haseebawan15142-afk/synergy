/**
 * Compare first-byte / size for default (local) vs active theme (Firebase) hero clips.
 * Usage: node scripts/bench-hero-videos.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, ".env.local"));

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const base = process.env.BENCH_BASE_URL || "http://localhost:3000";

async function timeUrl(label, url, { bytes = 256 * 1024 } = {}) {
  const started = performance.now();
  let status = 0;
  let ttfb = null;
  let firstChunkMs = null;
  let contentLength = null;
  let error = null;
  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${bytes - 1}` },
    });
    status = res.status;
    ttfb = Math.round(performance.now() - started);
    contentLength = res.headers.get("content-length") || res.headers.get("content-range") || "?";
    const reader = res.body?.getReader();
    if (reader) {
      await reader.read();
      firstChunkMs = Math.round(performance.now() - started);
      reader.cancel().catch(() => undefined);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return { label, url: url.slice(0, 96), status, ttfbMs: ttfb, firstChunkMs, contentLength, error };
}

const localClips = [
  `${base}/videos/hero/landing-01.mp4`,
  `${base}/videos/hero/landing-01-poster.webp`,
];

const active = (await db.collection("theme").doc("activePreset").get()).data();
const eventClips = Array.isArray(active?.heroVideos) ? active.heroVideos : [];

console.log("\n=== Hero video latency report ===");
console.log(`Base: ${base}`);
console.log(`Active theme: ${active?.presetId || "(none)"}`);
console.log(`Event clips: ${eventClips.length}\n`);

const rows = [];
for (const url of localClips) {
  rows.push(await timeUrl(url.includes("poster") ? "DEFAULT poster" : "DEFAULT video", url));
}

eventClips.slice(0, 3).forEach((clip, i) => {
  void clip;
});

for (let i = 0; i < Math.min(3, eventClips.length); i++) {
  const clip = eventClips[i];
  if (clip?.mp4) rows.push(await timeUrl(`EVENT clip ${i + 1} video`, String(clip.mp4)));
  if (clip?.poster) rows.push(await timeUrl(`EVENT clip ${i + 1} poster`, String(clip.poster)));
  else rows.push({
    label: `EVENT clip ${i + 1} poster`,
    url: "(missing — causes black/ink until first video frame)",
    status: 0,
    ttfbMs: null,
    firstChunkMs: null,
    contentLength: null,
    error: "NO_POSTER",
  });
}

for (const row of rows) {
  console.log(
    [
      row.label.padEnd(22),
      row.error ? `ERR ${row.error}` : `HTTP ${row.status}`,
      row.ttfbMs != null ? `TTFB ${row.ttfbMs}ms` : "TTFB n/a",
      row.firstChunkMs != null ? `chunk ${row.firstChunkMs}ms` : "",
      row.contentLength ? `len ${row.contentLength}` : "",
    ]
      .filter(Boolean)
      .join(" | "),
  );
  console.log(`  ${row.url}`);
}

const defaultVideo = rows.find((r) => r.label === "DEFAULT video");
const eventVideo = rows.find((r) => r.label.startsWith("EVENT clip") && r.label.endsWith("video"));
console.log("\n=== Verdict ===");
if (defaultVideo?.ttfbMs != null && eventVideo?.ttfbMs != null) {
  const ratio = (eventVideo.ttfbMs / Math.max(defaultVideo.ttfbMs, 1)).toFixed(1);
  console.log(
    `Default TTFB ${defaultVideo.ttfbMs}ms vs Event TTFB ${eventVideo.ttfbMs}ms (${ratio}x).`,
  );
  console.log(
    "UX fix: SSR preload + instant poster paint + autoPlay (no readyState/inView gate). Re-upload clips to auto-attach posters.",
  );
} else if (!eventVideo) {
  console.log("No event clips on active theme — default landing path only.");
} else {
  console.log("Could not compare (is `npm run dev` on :3000?).");
}
console.log("");
