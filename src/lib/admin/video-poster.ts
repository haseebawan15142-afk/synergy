/** Grab a WebP poster from the first playable frame of a local video File. */

export async function extractPosterFromVideoFile(file: File): Promise<File | null> {
  if (typeof document === "undefined") return null;

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const fail = () => reject(new Error("Could not read video for poster"));
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      video.addEventListener("error", fail, { once: true });
    });

    const target = Math.min(0.35, Math.max(0.05, (video.duration || 1) * 0.04));
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = target;
      await new Promise<void>((resolve) => {
        video.addEventListener("seeked", () => resolve(), { once: true });
        window.setTimeout(() => resolve(), 800);
      });
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    const maxW = 1280;
    const scale = width > maxW ? maxW / width : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.82),
    );
    if (!blob) return null;

    const base = file.name.replace(/\.[^.]+$/, "") || "clip";
    return new File([blob], `${base}-poster.webp`, { type: "image/webp" });
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute("src");
    video.load();
  }
}
