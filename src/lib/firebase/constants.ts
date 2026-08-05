export const ADMIN_SESSION_COOKIE = "admin_token";

/** Temporary: skip Firebase Auth for /admin. Set NEXT_PUBLIC_ADMIN_AUTH_BYPASS=false to re-enable. */
export const ADMIN_AUTH_BYPASS = process.env.NEXT_PUBLIC_ADMIN_AUTH_BYPASS === "true";
