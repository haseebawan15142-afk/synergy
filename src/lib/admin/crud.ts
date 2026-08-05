import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

/** Firestore rejects `undefined` field values — strip them before write. */
export function stripUndefined<T extends DocumentData>(data: T): T {
  const out: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  return out as T;
}

export async function listCollection<T extends object>(name: string): Promise<T[]> {
  const snap = await getDocs(collection(getFirebaseDb(), name));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<T, "id">) }) as T);
}

/**
 * Client-side sort. Do NOT use Firestore orderBy(sortOrder) — docs missing that
 * field are silently excluded from results (empty careers/partners lists).
 */
export async function listOrdered<T extends object>(
  name: string,
  field = "sortOrder",
): Promise<T[]> {
  const all = await listCollection<T>(name);
  return all.sort((a, b) => {
    const recordA = a as Record<string, unknown>;
    const recordB = b as Record<string, unknown>;
    const av = typeof recordA[field] === "number" ? (recordA[field] as number) : Number.MAX_SAFE_INTEGER;
    const bv = typeof recordB[field] === "number" ? (recordB[field] as number) : Number.MAX_SAFE_INTEGER;
    if (av !== bv) return av - bv;
    const labelA = String(recordA.title || recordA.name || recordA.slug || "");
    const labelB = String(recordB.title || recordB.name || recordB.slug || "");
    return labelA.localeCompare(labelB);
  });
}

export async function getById<T extends object>(name: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(getFirebaseDb(), name, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<T, "id">) } as T;
}

export async function createDoc<T extends DocumentData>(
  name: string,
  data: T,
  id?: string,
): Promise<string> {
  const payload = stripUndefined({
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (id) {
    await setDoc(doc(getFirebaseDb(), name, id), payload, { merge: true });
    return id;
  }
  const ref = await addDoc(collection(getFirebaseDb(), name), payload);
  return ref.id;
}

export async function updateDocById(
  name: string,
  id: string,
  data: DocumentData,
): Promise<void> {
  await updateDoc(
    doc(getFirebaseDb(), name, id),
    stripUndefined({
      ...data,
      updatedAt: serverTimestamp(),
    }),
  );
}

export async function deleteDocById(name: string, id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), name, id));
}

export async function upsertSingleton(name: string, id: string, data: DocumentData) {
  await setDoc(
    doc(getFirebaseDb(), name, id),
    stripUndefined({ ...data, updatedAt: serverTimestamp() }),
    { merge: true },
  );
}

export async function logActivity(input: {
  type: string;
  message: string;
  actorEmail?: string;
  actorUid?: string;
  entity?: string;
  entityId?: string;
}) {
  await addDoc(
    collection(getFirebaseDb(), COLLECTIONS.activities),
    stripUndefined({
      type: input.type,
      message: input.message,
      actorEmail: input.actorEmail || "",
      actorUid: input.actorUid || "",
      entity: input.entity || "",
      entityId: input.entityId || "",
      createdAt: serverTimestamp(),
    }),
  );
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function estimateReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
