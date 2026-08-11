/**
 * Read and parse a JSON request body with a hard byte/char ceiling.
 * Rejects oversized Content-Length before reading when present.
 */
export async function readLimitedJson(
  request: Request,
  maxBytes: number,
): Promise<
  | { ok: true; value: unknown }
  | { ok: false; error: "payload_too_large" | "invalid_json" }
> {
  const declared = request.headers.get("content-length");
  if (declared) {
    const n = Number(declared);
    if (Number.isFinite(n) && n > maxBytes) {
      return { ok: false, error: "payload_too_large" };
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  // UTF-16 length is a safe upper bound for UTF-8 byte size for abuse checks.
  if (text.length > maxBytes) {
    return { ok: false, error: "payload_too_large" };
  }

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
