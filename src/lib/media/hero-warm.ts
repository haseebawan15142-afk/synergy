const CACHE_NAME = "synergy-hero-videos-v2";

/** Start downloading a hero clip into the Cache API as early as possible. */
export function warmHeroVideo(url: string): void {
  if (!url || typeof window === "undefined" || !("caches" in window)) return;
  if (url.startsWith("/")) {
    // Same-origin — browser HTTP cache + <link rel=preload> is enough.
    return;
  }

  void (async () => {
    try {
      // Drop the previous warm cache so replaced Firebase URLs are not sticky.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("synergy-hero-videos-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      );

      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(url);
      if (hit) return;
      const res = await fetch(url, { mode: "cors", credentials: "omit", cache: "no-cache" });
      if (res.ok) await cache.put(url, res.clone());
    } catch {
      /* CORS / offline — preload link still helps */
    }
  })();
}
