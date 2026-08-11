import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminDb } from "@/lib/firebase/admin";
import { takeRateLimit } from "@/lib/security/rate-limit";
import { readLimitedJson } from "@/lib/security/read-limited-json";
import {
  CONTACT_LIMITS,
  clientIpKey,
  isHoneypotFilled,
  isValidEmail,
} from "@/lib/security/public-form";

export const runtime = "nodejs";

/** Public contact form — ~1 submission / 5 min average. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60_000;

export async function POST(request: Request) {
  const limited = takeRateLimit(clientIpKey(request, "contact"), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: limited.retryAfterSec },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  const parsed = await readLimitedJson(request, CONTACT_LIMITS.bodyBytes);
  if (!parsed.ok) {
    const status = parsed.error === "payload_too_large" ? 413 : 400;
    return NextResponse.json({ error: parsed.error }, { status });
  }

  if (typeof parsed.value !== "object" || parsed.value === null || Array.isArray(parsed.value)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const body = parsed.value as Record<string, unknown>;

  // Hidden honeypot — bots that fill it get a fake success (no write).
  if (isHoneypotFilled(body.companyWebsite)) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "fields_required" }, { status: 400 });
  }
  if (name.length > CONTACT_LIMITS.name) {
    return NextResponse.json({ error: "name_too_long" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (message.length > CONTACT_LIMITS.message) {
    return NextResponse.json({ error: "message_too_long" }, { status: 400 });
  }

  try {
    const ref = await getAdminDb().collection(COLLECTIONS.messages).add({
      name,
      email,
      message,
      status: "unread",
      replyStatus: "none",
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }
}
