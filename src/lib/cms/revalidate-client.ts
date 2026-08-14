/**
 * Ask the Next server to drop ISR / Data Cache entries after an admin publish.
 * Safe to call from the browser; failures are ignored so Firestore writes still win.
 */
export async function requestPublicCmsRevalidate(
  tags: Array<"cms-theme" | "cms-settings" | "cms-blogs" | string> = ["cms-theme"],
  paths: string[] = [],
): Promise<void> {
  try {
    await fetch("/api/admin/revalidate-cms", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags, paths }),
    });
  } catch {
    /* offline / non-admin preview */
  }
}
