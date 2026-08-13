/**
 * Ask the Next server to drop ISR / Data Cache entries after an admin publish.
 * Safe to call from the browser; failures are ignored so Firestore writes still win.
 */
export async function requestPublicCmsRevalidate(
  tags: Array<"cms-theme" | "cms-settings" | string> = ["cms-theme"],
): Promise<void> {
  try {
    await fetch("/api/admin/revalidate-cms", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
  } catch {
    /* offline / non-admin preview — public clients still refresh via Firestore live sync */
  }
}
