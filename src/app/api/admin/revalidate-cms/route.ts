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
  "cms-clients",
  "cms-case-studies",
  "cms-nav",
  "cms-newsletter",
]);

/**
 * Bust Next Data Cache / ISR after admin publishes CMS content.
 * Also clears the server in-memory `cachedCms` map — browser invalidate
 * cannot reach the Node process that serves SSR.
 */
export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  // Critical: public-server loaders call public.ts → cachedCms in this process.
  invalidateCmsCache();

  let tags: string[] = ["cms-theme", "cms-settings"];
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
    /* empty body → theme + settings */
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  // Always refresh shell + home so landing hero / marquees update.
  revalidatePath("/", "layout");
  revalidatePath("/");
  if (tags.includes("cms-blogs")) {
    revalidatePath("/resources");
  }
  if (tags.includes("cms-services")) {
    revalidatePath("/services");
  }
  if (tags.includes("cms-partners")) {
    revalidatePath("/partners");
  }
  if (tags.includes("cms-case-studies")) {
    revalidatePath("/case-studies");
  }
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, tags, paths });
}
