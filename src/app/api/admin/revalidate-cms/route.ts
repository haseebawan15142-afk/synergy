import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/admin-session";

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

/**
 * Bust Next Data Cache / ISR after admin publishes theme or settings.
 * Admin browser `invalidateCmsCache` cannot clear the server cache.
 */
export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  let tags: string[] = ["cms-theme"];
  try {
    const body = (await request.json()) as { tags?: unknown };
    if (Array.isArray(body.tags)) {
      const next = body.tags
        .map((t) => String(t || "").trim())
        .filter((t) => ALLOWED_TAGS.has(t));
      if (next.length) tags = [...new Set(next)];
    }
  } catch {
    /* empty body → theme tags */
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }
  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ ok: true, tags });
}
