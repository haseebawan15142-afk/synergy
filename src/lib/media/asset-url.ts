/**
 * Public-site asset resilience helpers.
 * Prefer same-origin (`/images/...`, `/brand/...`) over Firebase Storage so
 * critical visuals keep working if Storage/CDN is unreachable.
 */

export function cleanAssetUrl(url?: string | null): string {
  return String(url || "").trim();
}

export function isSameOriginAsset(url: string): boolean {
  const value = url.trim();
  return value.startsWith("/") && !value.startsWith("//");
}

export function isRemoteStorageUrl(url: string): boolean {
  const value = url.trim().toLowerCase();
  if (!value) return false;
  return (
    value.includes("firebasestorage.googleapis.com") ||
    value.includes("storage.googleapis.com") ||
    value.includes(".firebasestorage.app")
  );
}

/**
 * Resolve a CMS media URL for the public site.
 * Admin CMS wins when a URL is set (including Firebase Storage).
 * Local seed/bundle is only used when CMS is empty (offline / never provisioned).
 */
export function resolveResilientAssetUrl(
  cmsUrl?: string | null,
  localFallback?: string | null,
): string {
  const cms = cleanAssetUrl(cmsUrl);
  const local = cleanAssetUrl(localFallback);

  if (cms) return cms;
  return local;
}
