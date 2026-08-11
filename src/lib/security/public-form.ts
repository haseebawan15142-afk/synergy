/** Shared validation for public contact / newsletter intakes. */

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  message: 5000,
  bodyBytes: 12_000,
} as const;

export const NEWSLETTER_LIMITS = {
  email: 254,
  name: 120,
  bodyBytes: 4_000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  if (value.length < 3 || value.length > CONTACT_LIMITS.email) return false;
  return EMAIL_RE.test(value);
}

export function clientIpKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip =
    forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
  return `${prefix}:${ip}`;
}

export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
