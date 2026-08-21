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

/** Extensions we recognize; unknown video/* still accepted via probe. */
const KNOWN_EXTENSIONS = new Set([
  "mp4",
  "webm",
  "mov",
  "mkv",
  "avi",
  "m4v",
  "mpeg",
  "mpg",
  "3gp",
  "wmv",
  "flv",
  "ogv",
  "ogg",
  "mts",
  "m2ts",
  "ts",
  "vob",
  "asf",
  "f4v",
  "hevc",
  "h264",
  "mxf",
  "rm",
  "rmvb",
  "divx",
]);

const MIME_TO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
  "video/mpeg": "mpeg",
  "video/3gpp": "3gp",
  "video/x-ms-wmv": "wmv",
  "video/x-flv": "flv",
  "video/ogg": "ogv",
  "video/mp2t": "ts",
  "application/mxf": "mxf",
};

function extensionFromName(fileName: string): string | null {
  const raw = fileName.includes(".") ? fileName.split(".").pop() || "" : "";
  const ext = raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  if (!ext || !KNOWN_EXTENSIONS.has(ext)) return null;
  return ext;
}

function resolveInputExt(fileName: string, mime: string): string {
  const fromName = extensionFromName(fileName);
  if (fromName) return fromName;
  const fromMime = MIME_TO_EXT[mime.trim().toLowerCase()];
  if (fromMime) return fromMime;
  // Generic name — ffmpeg probes container from file bytes.
  return "bin";
}

function assertPathInside(baseDir: string, targetPath: string) {
  const root = resolve(baseDir) + sep;
  const resolved = resolve(targetPath);
  if (resolved !== resolve(baseDir) && !resolved.startsWith(root)) {
    throw new Error("Invalid path");
  }
}

function isAllowedUpload(mime: string, fileName: string): boolean {
  const value = mime.trim().toLowerCase();
  if (value.startsWith("video/")) return true;
  if (!value || value === "application/octet-stream") {
    return Boolean(extensionFromName(fileName)) || !value;
  }
  if (value.startsWith("image/") || value === "application/pdf" || value.startsWith("audio/")) {
    return false;
  }
  return Boolean(extensionFromName(fileName));
}

export async function POST(request: Request) {
  let workDir: string | null = null;

  try {
    const auth = await requireAdminRequest(request);
    if (!auth.ok) return auth.response;

    if (!ffmpegPath) {
      return NextResponse.json(
        { error: "Video converter unavailable (ffmpeg missing). Run npm install." },
        { status: 500 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Video must be under 120 MB" }, { status: 400 });
    }
    if (!isAllowedUpload(file.type || "", file.name || "")) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a video in any common format." },
        { status: 400 },
      );
    }

    const ext = resolveInputExt(file.name || "upload.bin", file.type || "");
    workDir = join(tmpdir(), `synergy-vid-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, `input.${ext}`);
    const outputPath = join(workDir, "output.mp4");
    assertPathInside(workDir, inputPath);
    assertPathInside(workDir, outputPath);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, bytes);

    // Fixed ffmpeg argv only — any input container → H.264 MP4 for hero playback.
    await execFileAsync(
      ffmpegPath,
      [
        "-y",
        "-i",
        inputPath,
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
    const detail =
      err && typeof err === "object" && "stderr" in err && typeof (err as { stderr: unknown }).stderr === "string"
        ? String((err as { stderr: string }).stderr).slice(-400)
        : "";
    console.error("[convert-video] failed", detail || err);
    return NextResponse.json(
      {
        error: detail
          ? "Could not convert this video. Try another file or a shorter clip under 120 MB."
          : "Convert failed. Check that the file is a valid video.",
      },
      { status: 500 },
    );
  } finally {
    if (workDir) {
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
