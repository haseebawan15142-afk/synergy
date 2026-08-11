import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { takeRateLimit } from "@/lib/security/rate-limit";
import { readLimitedJson } from "@/lib/security/read-limited-json";
import {
  NEWSLETTER_LIMITS,
  clientIpKey,
  isHoneypotFilled,
  isValidEmail,
} from "@/lib/security/public-form";

export const runtime = "nodejs";

/** Public newsletter subscribe — tighter than contact. */
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60_000;

export async function POST(request: Request) {
  const limited = takeRateLimit(clientIpKey(request, "newsletter"), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const parsed = await readLimitedJson(request, NEWSLETTER_LIMITS.bodyBytes);
  if (!parsed.ok) {
    const status = parsed.error === "payload_too_large" ? 413 : 400;
    return NextResponse.json({ error: parsed.error }, { status });
  }

  if (typeof parsed.value !== "object" || parsed.value === null || Array.isArray(parsed.value)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const body = parsed.value as Record<string, unknown>;

  if (isHoneypotFilled(body.companyWebsite)) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, NEWSLETTER_LIMITS.name)
      : undefined;

  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const existing = await db
      .collection(COLLECTIONS.newsletter)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Idempotent success — do not leak whether the address was already stored beyond ok.
      return NextResponse.json({ ok: true });
    }

    const payload: Record<string, unknown> = {
      email,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    };
    if (name) payload.name = name;

    await db.collection(COLLECTIONS.newsletter).add(payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }
}
