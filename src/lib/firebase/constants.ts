export const ADMIN_SESSION_COOKIE = "admin_token";

/** Companion cookie: HMAC proof that Firestore admin role was verified at mint time. */
export const ADMIN_GATE_COOKIE = "admin_gate";

/**
 * Dev-only auth bypass. Hard-disabled in production even if the env flag is set.
 * Do not enable in production.
 */
export const ADMIN_AUTH_BYPASS =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ADMIN_AUTH_BYPASS === "true";
