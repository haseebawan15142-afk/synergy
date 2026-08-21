/**
 * Ask the Next server to drop ISR / Data Cache entries after an admin publish.
 * Returns whether the bust succeeded so callers can warn the admin.
 */
export async function requestPublicCmsRevalidate(
  tags: Array<"cms-theme" | "cms-settings" | "cms-blogs" | string> = ["cms-theme"],
  paths: string[] = [],
): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/revalidate-cms", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags, paths }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
