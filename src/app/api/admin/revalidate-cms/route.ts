import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/admin-session";
import { invalidateCmsCache } from "@/lib/cms/cache";

export const runtime = "nodejs";

const ALLOWED_TAGS = new Set([
  "cms-theme",
  "cms-settings",
  "cms-blogs",
  "cms-offices",
  "cms-services",
  "cms-partners",
  "cms-nav",
  "cms-newsletter",
]);

const TAG_TO_CACHE_PREFIX: Record<string, string> = {
  "cms-theme": "theme",
  "cms-settings": "settings",
  "cms-blogs": "blogs",
  "cms-offices": "offices",
  "cms-services": "services",
  "cms-partners": "partners",
  "cms-nav": "nav",
  "cms-newsletter": "newsletter",
};

/**
 * Bust Next Data Cache / ISR after admin publishes CMS content.
 * Also clears the server in-memory CMS map so chat + SSR see deletes immediately.
 */
export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  let tags: string[] = ["cms-theme"];
  let paths: string[] = [];
  try {
    const body = (await request.json()) as { tags?: unknown; paths?: unknown };
    if (Array.isArray(body.tags)) {
      const next = body.tags
        .map((t) => String(t || "").trim())
        .filter((t) => ALLOWED_TAGS.has(t));
      if (next.length) tags = [...new Set(next)];
    }
    if (Array.isArray(body.paths)) {
      paths = body.paths
        .map((p) => String(p || "").trim())
        .filter((p) => p.startsWith("/") && !p.startsWith("//") && p.length < 200)
        .slice(0, 20);
    }
  } catch {
    /* empty body → theme tags */
  }

  for (const tag of tags) {
    revalidateTag(tag);
    const prefix = TAG_TO_CACHE_PREFIX[tag];
    if (prefix) invalidateCmsCache(prefix);
  }

  // Always refresh shell + home; blogs also need /resources.
  revalidatePath("/", "layout");
  revalidatePath("/");
  if (tags.includes("cms-blogs")) {
    revalidatePath("/resources");
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, tags, paths });
}
