/**
 * Short-lived in-memory CMS cache with stale-on-error.
 * After a successful read, a Firebase blip serves the last good payload
 * instead of immediately dropping to empty/local defaults.
 */

type Entry<T> = { at: number; data: T };

const store = new Map<string, Entry<unknown>>();

/** Fresh window — admin publish still appears within about a minute. */
const DEFAULT_TTL_MS = 60_000;

export async function cachedCms<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data;
  }

  try {
    const data = await loader();
    store.set(key, { at: Date.now(), data });
    return data;
  } catch (error) {
    if (hit) return hit.data;
    throw error;
  }
}

export function invalidateCmsCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
