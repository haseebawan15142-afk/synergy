/**
 * Server-rendered early hints so the first hero clip/poster start before JS hydrates.
 * Next.js hoists these <link> tags into <head>.
 */
export function HeroVideoPreload({
  mp4,
  poster,
}: {
  mp4?: string | null;
  poster?: string | null;
}) {
  const video = String(mp4 || "").trim();
  const image = String(poster || "").trim();
  if (!video && !image) return null;

  return (
    <>
      {image ? (
        <link rel="preload" as="image" href={image} fetchPriority="high" />
      ) : null}
      {video ? (
        <link rel="preload" as="video" href={video} type="video/mp4" fetchPriority="high" />
      ) : null}
    </>
  );
}
