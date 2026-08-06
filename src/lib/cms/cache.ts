/** Short-lived in-memory cache so route changes do not re-hit Firestore every time. */

type Entry<T> = { at: number; data: T };

const store = new Map<string, Entry<unknown>>();
/** Keep short so admin publish/delete appears on the site quickly. */
const DEFAULT_TTL_MS = 15_000;

export async function cachedCms<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data;
  }
  const data = await loader();
  store.set(key, { at: Date.now(), data });
  return data;
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
