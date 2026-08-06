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
import { convertImageToWebp, isConvertibleImage } from "@/lib/admin/image-convert";

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

/**
 * Upload a file to Firebase Storage (+ media index in Firestore).
 * Raster images are converted to WebP in the browser before upload.
 */
export async function uploadMediaFile(
  file: File,
  folder: MediaFolder | string,
  options?: {
    onProgress?: (pct: number) => void;
    createdBy?: string;
    alt?: string;
    /** Called while converting to WebP (before bytes upload). */
    onPhase?: (phase: "converting" | "uploading") => void;
  },
): Promise<MediaAsset> {
  let uploadFile = file;

  if (isConvertibleImage(file)) {
    options?.onPhase?.("converting");
    options?.onProgress?.(5);
    try {
      uploadFile = await convertImageToWebp(file);
    } catch {
      uploadFile = file;
    }
  }

  options?.onPhase?.("uploading");

  const ext =
    uploadFile.type === "image/webp"
      ? ".webp"
      : uploadFile.name.includes(".")
        ? ""
        : "";
  const named =
    uploadFile.type === "image/webp" && !uploadFile.name.toLowerCase().endsWith(".webp")
      ? `${safeName(uploadFile.name.replace(/\.[^.]+$/, ""))}.webp`
      : safeName(uploadFile.name);

  const path = `${folder}/${Date.now()}-${named}${ext && !named.endsWith(".webp") ? ext : ""}`;
  const storageRef = ref(getFirebaseStorage(), path);
  const task = uploadBytesResumable(storageRef, uploadFile, {
    contentType: uploadFile.type || "application/octet-stream",
    cacheControl: "public,max-age=31536000,immutable",
  });

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (!options?.onProgress || !snap.totalBytes) return;
        // Reserve 0–10% for convert; 10–100% for upload
        const uploadPct = Math.round((snap.bytesTransferred / snap.totalBytes) * 90);
        options.onProgress(10 + uploadPct);
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const asset: Omit<MediaAsset, "id"> = {
            name: uploadFile.name,
            url,
            path,
            folder,
            contentType: uploadFile.type || "application/octet-stream",
            size: uploadFile.size,
            alt: options?.alt || uploadFile.name,
            createdBy: options?.createdBy,
            createdAt: null,
            updatedAt: null,
          };
          const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.media), {
            ...asset,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          options?.onProgress?.(100);
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
