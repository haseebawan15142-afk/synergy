/**
 * Re-encode hero + CEO videos for web delivery (H.264 MP4 + optional VP9 WebM + poster JPG).
 * Run: npm run optimize:videos
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ffmpeg = ffmpegPath;

if (!ffmpeg || !fs.existsSync(ffmpeg)) {
  console.error("[optimize-videos] ffmpeg binary not found. Run: npm install");
  process.exit(1);
}

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function run(args) {
  execFileSync(ffmpeg, args, { stdio: "inherit" });
}

function optimizeVideo(inputPath, outDir, baseName, crf = 30) {
  if (!fs.existsSync(inputPath)) {
    console.warn(`[optimize-videos] skip missing: ${inputPath}`);
    return;
  }

  const before = fs.statSync(inputPath).size;
  const tmpMp4 = path.join(outDir, `${baseName}.tmp.mp4`);
  const outMp4 = path.join(outDir, `${baseName}.mp4`);
  const outWebm = path.join(outDir, `${baseName}.webm`);
  const outPoster = path.join(outDir, `${baseName}-poster.jpg`);

  console.log(`\n[optimize-videos] ${baseName} (${mb(before)})`);

  run([
    "-y",
    "-i",
    inputPath,
    "-vf",
    "scale=-2:720",
    "-c:v",
    "libx264",
    "-crf",
    String(crf),
    "-preset",
    "slow",
    "-an",
    "-movflags",
    "+faststart",
    tmpMp4,
  ]);

  fs.renameSync(tmpMp4, outMp4);

  const mp4Size = fs.statSync(outMp4).size;
  console.log(`  mp4: ${mb(mp4Size)} (was ${mb(before)})`);

  run([
    "-y",
    "-i",
    outMp4,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "38",
    "-b:v",
    "0",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    "-an",
    outWebm,
  ]);

  if (fs.existsSync(outWebm) && fs.statSync(outWebm).size >= mp4Size) {
    fs.unlinkSync(outWebm);
    console.log("  webm: skipped (larger than mp4)");
  } else if (fs.existsSync(outWebm)) {
    console.log(`  webm: ${mb(fs.statSync(outWebm).size)}`);
  }

  run(["-y", "-i", outMp4, "-ss", "00:00:00.5", "-vframes", "1", "-q:v", "4", outPoster]);
  console.log(`  poster: ${outPoster}`);
}

const heroDir = path.join(root, "public", "videos", "hero");
const videosDir = path.join(root, "public", "videos");

fs.mkdirSync(heroDir, { recursive: true });

optimizeVideo(path.join(heroDir, "landing-01.mp4"), heroDir, "landing-01", 32);

for (const name of ["landing-02", "landing-03", "landing-04"]) {
  optimizeVideo(path.join(heroDir, `${name}.mp4`), heroDir, name);
}

optimizeVideo(path.join(videosDir, "my-ceo-video.mp4"), videosDir, "my-ceo-video");

console.log("\n[optimize-videos] done");
