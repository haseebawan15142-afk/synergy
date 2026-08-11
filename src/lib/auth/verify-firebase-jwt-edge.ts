import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

/**
 * Edge-safe Firebase ID token verification (signature + audience + issuer + exp).
 * Admin cookies store ID tokens (not Firebase session cookies) so this JWKS path is reliable.
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type FirebaseJwtClaims = {
  uid: string;
  email?: string;
  payload: JWTPayload;
};

export async function verifyFirebaseIdTokenEdge(
  token: string,
): Promise<FirebaseJwtClaims | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId || !token) return null;

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid = String(payload.sub || payload.user_id || "").trim();
    if (!uid) return null;

    return {
      uid,
      email: typeof payload.email === "string" ? payload.email : undefined,
      payload,
    };
  } catch {
    return null;
  }
}
