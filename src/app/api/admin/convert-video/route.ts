import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";
import { requireAdminRequest } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const maxDuration = 120;

const execFileAsync = promisify(execFile);
const MAX_BYTES = 120 * 1024 * 1024; // 120 MB

const ALLOWED_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "mkv",
  "avi",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
]);

const ALLOWED_MIME_PREFIXES = ["video/"];

function safeExtension(fileName: string): string | null {
  const raw = fileName.includes(".") ? fileName.split(".").pop() || "" : "";
  const ext = raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) return null;
  return ext;
}

function assertPathInside(baseDir: string, targetPath: string) {
  const root = resolve(baseDir) + sep;
  const resolved = resolve(targetPath);
  if (resolved !== resolve(baseDir) && !resolved.startsWith(root)) {
    throw new Error("Invalid path");
  }
}

function isAllowedMime(mime: string): boolean {
  const value = mime.trim().toLowerCase();
  if (!value || value === "application/octet-stream") return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export async function POST(request: Request) {
  let workDir: string | null = null;

  try {
    const auth = await requireAdminRequest(request);
    if (!auth.ok) return auth.response;

    if (!ffmpegPath) {
      return NextResponse.json({ error: "ffmpeg not installed" }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Video must be under 120 MB" }, { status: 400 });
    }
    if (!isAllowedMime(file.type || "")) {
      return NextResponse.json({ error: "Unsupported media type" }, { status: 400 });
    }

    const ext = safeExtension(file.name || "upload.bin");
    if (!ext) {
      return NextResponse.json({ error: "Unsupported video format" }, { status: 400 });
    }

    workDir = join(tmpdir(), `synergy-vid-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, `input.${ext}`);
    const outputPath = join(workDir, "output.mp4");
    assertPathInside(workDir, inputPath);
    assertPathInside(workDir, outputPath);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, bytes);

    // Fixed ffmpeg argv only — no user-controlled args or paths.
    await execFileAsync(
      ffmpegPath,
      [
        "-y",
        "-i",
        inputPath,
        // 640p + CRF 30 keeps hero backgrounds light for Firebase first-paint.
        "-vf",
        "scale=-2:640:force_original_aspect_ratio=decrease",
        "-r",
        "24",
        "-c:v",
        "libx264",
        "-profile:v",
        "main",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "30",
        "-preset",
        "veryfast",
        "-an",
        "-movflags",
        "+faststart",
        outputPath,
      ],
      { timeout: 110_000, maxBuffer: 8 * 1024 * 1024 },
    );

    assertPathInside(workDir, outputPath);
    const mp4 = await readFile(outputPath);
    return new NextResponse(mp4, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[convert-video] failed");
    return NextResponse.json({ error: "Convert failed" }, { status: 500 });
  } finally {
    if (workDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
