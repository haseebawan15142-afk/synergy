const CACHE_PREFIX = "synergy-hero-videos-";

/** Warm a remote hero URL without sticky Cache API (deleted Storage files must not keep playing). */
export function warmHeroVideo(url: string): void {
  if (!url || typeof window === "undefined") return;
  if (url.startsWith("/")) return;

  void (async () => {
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((k) => caches.delete(k)),
        );
      }
      // Fire-and-forget network warm — do not store forever in Cache API.
      await fetch(url, { mode: "cors", credentials: "omit", cache: "no-store" });
    } catch {
      /* CORS / offline — <video preload> still helps */
    }
  })();
}
