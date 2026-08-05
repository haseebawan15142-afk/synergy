import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { MediaAsset, MediaFolder } from "@/lib/admin/types";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
}

export async function listMedia(folder?: string): Promise<MediaAsset[]> {
  try {
    const base = collection(getFirebaseDb(), COLLECTIONS.media);
    const q = folder
      ? query(base, where("folder", "==", folder), orderBy("createdAt", "desc"))
      : query(base, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, "id">) }));
  } catch {
    const snap = await getDocs(collection(getFirebaseDb(), COLLECTIONS.media));
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, "id">) }));
    return folder ? items.filter((i) => i.folder === folder) : items;
  }
}

export function uploadMediaFile(
  file: File,
  folder: MediaFolder | string,
  options?: {
    onProgress?: (pct: number) => void;
    createdBy?: string;
    alt?: string;
  },
): Promise<MediaAsset> {
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const storageRef = ref(getFirebaseStorage(), path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (!options?.onProgress || !snap.totalBytes) return;
        options.onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const asset: Omit<MediaAsset, "id"> = {
            name: file.name,
            url,
            path,
            folder,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            alt: options?.alt || file.name,
            createdBy: options?.createdBy,
            createdAt: null,
            updatedAt: null,
          };
          const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.media), {
            ...asset,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          resolve({ id: docRef.id, ...asset });
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

export async function renameMedia(id: string, name: string) {
  await updateDoc(doc(getFirebaseDb(), COLLECTIONS.media, id), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMedia(asset: MediaAsset) {
  if (asset.path) {
    try {
      await deleteObject(ref(getFirebaseStorage(), asset.path));
    } catch {
      /* file may already be gone */
    }
  }
  if (asset.id) {
    await deleteDoc(doc(getFirebaseDb(), COLLECTIONS.media, asset.id));
  }
}
