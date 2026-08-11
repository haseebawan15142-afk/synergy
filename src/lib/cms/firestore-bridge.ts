/**
 * Firestore reads that work in both environments:
 * - Server (RSC / Node): Firebase Admin — avoids client-SDK gRPC failures behind
 *   SSL-inspecting proxies ("self-signed certificate in certificate chain").
 * - Browser: Firebase web client SDK.
 */

export type CmsDocRow = {
  id: string;
  data: Record<string, unknown>;
};

export async function readCmsDoc(
  collectionName: string,
  docId: string,
): Promise<Record<string, unknown> | null> {
  if (typeof window === "undefined") {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      const snap = await getAdminDb().collection(collectionName).doc(docId).get();
      if (!snap.exists) return null;
      return (snap.data() || {}) as Record<string, unknown>;
    } catch (error) {
      console.warn(
        `[cms] Admin read failed for ${collectionName}/${docId}; trying client SDK`,
        error,
      );
    }
  }

  const { doc, getDoc } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/lib/firebase/client");
  const snap = await getDoc(doc(getFirebaseDb(), collectionName, docId));
  if (!snap.exists()) return null;
  return snap.data() as Record<string, unknown>;
}

type EqualityFilter = {
  field: string;
  value: string | number | boolean;
};

/** Collection query with optional equality filters (server prefers Admin SDK). */
export async function queryCmsDocs(
  collectionName: string,
  options?: {
    where?: EqualityFilter[];
    limitCount?: number;
  },
): Promise<CmsDocRow[]> {
  const filters = options?.where || [];
  const limitCount = options?.limitCount;

  if (typeof window === "undefined") {
    try {
      const { getAdminDb } = await import("@/lib/firebase/admin");
      // Admin Query typing varies by SDK version — keep chain untyped.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let ref: any = getAdminDb().collection(collectionName);
      for (const filter of filters) {
        ref = ref.where(filter.field, "==", filter.value);
      }
      if (typeof limitCount === "number") {
        ref = ref.limit(limitCount);
      }
      const snap = await ref.get();
      return snap.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({
        id: d.id,
        data: (d.data() || {}) as Record<string, unknown>,
      }));
    } catch (error) {
      console.warn(
        `[cms] Admin query failed for ${collectionName}; trying client SDK`,
        error,
      );
    }
  }

  const {
    collection,
    getDocs,
    limit,
    query,
    where,
  } = await import("firebase/firestore");
  const { getFirebaseDb } = await import("@/lib/firebase/client");
  const constraints = [
    ...filters.map((f) => where(f.field, "==", f.value)),
    ...(typeof limitCount === "number" ? [limit(limitCount)] : []),
  ];
  const q =
    constraints.length > 0
      ? query(collection(getFirebaseDb(), collectionName), ...constraints)
      : collection(getFirebaseDb(), collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    data: d.data() as Record<string, unknown>,
  }));
}
