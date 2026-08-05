import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  type UploadMetadata,
} from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

/** Build a Storage reference from a path like `media/hero/landing-01.mp4`. */
export function storageRef(path: string) {
  return ref(getFirebaseStorage(), path);
}

/** Public download URL for an existing object. */
export async function getStorageUrl(path: string) {
  return getDownloadURL(storageRef(path));
}

/** Upload a file/blob and return its public download URL. */
export async function uploadToStorage(
  path: string,
  data: Blob | ArrayBuffer | Uint8Array,
  metadata?: UploadMetadata,
) {
  const snapshot = await uploadBytes(storageRef(path), data, metadata);
  return getDownloadURL(snapshot.ref);
}

/** Delete an object by path. */
export async function deleteFromStorage(path: string) {
  await deleteObject(storageRef(path));
}

/** List immediate children under a folder path. */
export async function listStorageFolder(path: string) {
  const result = await listAll(storageRef(path));
  return {
    folders: result.prefixes.map((p) => p.fullPath),
    files: result.items.map((item) => item.fullPath),
  };
}
