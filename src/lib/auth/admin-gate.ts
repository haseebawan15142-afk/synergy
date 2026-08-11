/**
 * Edge-safe HMAC gate proving admin role was verified server-side at session mint.
 * Always used together with a verified Firebase session/ID token — never alone.
 */

import { ADMIN_GATE_COOKIE } from "@/lib/firebase/constants";

export { ADMIN_GATE_COOKIE };

function getGateSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  // Fallback: Admin private key material (server/middleware env only — not NEXT_PUBLIC).
  const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")?.trim();
  if (pk) return pk;
  return "";
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  }
  return out === 0;
}

async function hmacSign(message: string): Promise<string> {
  const secret = getGateSecret();
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET (or FIREBASE_ADMIN_PRIVATE_KEY) for admin gate");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toBase64Url(sig);
}

/** `uid.exp.signature` — exp is unix seconds. */
export async function mintAdminGate(uid: string, maxAgeSec: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${uid}.${exp}`;
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

export async function verifyAdminGate(
  gateValue: string | undefined | null,
  expectedUid: string,
): Promise<boolean> {
  if (!gateValue || !expectedUid) return false;
  if (!getGateSecret()) return false;

  const parts = gateValue.split(".");
  if (parts.length !== 3) return false;
  const [uid, expStr, signature] = parts;
  if (!uid || !expStr || !signature) return false;
  if (uid !== expectedUid) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  try {
    const expected = await hmacSign(`${uid}.${expStr}`);
    return timingSafeEqual(signature, expected);
  } catch {
    return false;
  }
}
