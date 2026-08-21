import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { MediaAsset, MediaFolder } from "@/lib/admin/types";
import { MEDIA_FOLDERS } from "@/lib/admin/types";
import {
  convertImageForFirebase,
  isAcceptableImageUpload,
  shouldConvertToWebp,
} from "@/lib/admin/image-convert";

export type MediaLibraryItem = MediaAsset & {
  /** Referenced by live CMS / settings / theme docs (not local seed files) */
  used: boolean;
  /** Present in Firestore media index (false = Storage-only orphan until synced) */
  indexed: boolean;
};

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
}

function folderFromPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && (parts[1] === "hero" || parts[1] === "heroes")) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0] || "general";
}

function guessContentType(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
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

/** Recursively list every file path under a Storage prefix ("" = bucket root). */
async function listStoragePathsRecursive(prefix = ""): Promise<string[]> {
  const storage = getFirebaseStorage();
  const root = prefix ? ref(storage, prefix) : ref(storage);
  const result = await listAll(root);
  const files = result.items.map((item) => item.fullPath);
  for (const folder of result.prefixes) {
    // Skip Firebase reserved / junk prefixes if any
    if (folder.name.startsWith(".")) continue;
    files.push(...(await listStoragePathsRecursive(folder.fullPath)));
  }
  return files;
}

/**
 * Walk Firebase Storage and ensure every file has a Firestore `media` index doc.
 * Returns how many new index docs were created.
 */
export async function syncStorageToMediaIndex(options?: {
  createdBy?: string;
  onProgress?: (message: string) => void;
}): Promise<{ scanned: number; created: number; updated: number }> {
  options?.onProgress?.("Listing Storage files…");
  const paths = await listStoragePathsRecursive("");
  options?.onProgress?.(`Found ${paths.length} file(s). Reading media index…`);

  const existing = await listMedia();
  const byPath = new Map(existing.filter((a) => a.path).map((a) => [a.path, a]));

  let created = 0;
  let updated = 0;
  const storage = getFirebaseStorage();

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    options?.onProgress?.(`Indexing ${i + 1}/${paths.length}: ${path}`);
    const known = byPath.get(path);
    if (known?.id && known.url) continue;

    const fileRef = ref(storage, path);
    let url = "";
    let contentType = guessContentType(path);
    let size = 0;
    try {
      url = await getDownloadURL(fileRef);
      const meta = await getMetadata(fileRef);
      contentType = meta.contentType || contentType;
      size = Number(meta.size || 0);
    } catch {
      continue;
    }

    const folder = folderFromPath(path);
    const name = path.split("/").pop() || path;
    const payload: Omit<MediaAsset, "id"> = {
      name,
      url,
      path,
      folder,
      contentType,
      size,
      alt: name,
      createdBy: options?.createdBy,
      createdAt: null,
      updatedAt: null,
    };

    if (known?.id) {
      await updateDoc(doc(getFirebaseDb(), COLLECTIONS.media, known.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      updated += 1;
    } else {
      // Stable id from path so re-sync does not duplicate
      const id = path.replace(/[/#.[\]*]/g, "_").slice(0, 700);
      await setDoc(
        doc(getFirebaseDb(), COLLECTIONS.media, id),
        {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      created += 1;
    }
  }

  return { scanned: paths.length, created, updated };
}

/**
 * Collect every media URL referenced in live CMS (Firestore only).
 * Local seed `/images/...` files do NOT mark Firebase Storage copies as "in use".
 */
export async function collectUsedMediaUrls(): Promise<Set<string>> {
  const used = new Set<string>();
  const db = getFirebaseDb();

  const collectionsToScan: string[] = [
    COLLECTIONS.settings,
    COLLECTIONS.blogs,
    COLLECTIONS.leadership,
    COLLECTIONS.services,
    COLLECTIONS.partners,
    COLLECTIONS.clients,
    COLLECTIONS.caseStudies,
    COLLECTIONS.testimonials,
    COLLECTIONS.gallery,
    COLLECTIONS.careers,
    COLLECTIONS.events,
    COLLECTIONS.newsletter,
    COLLECTIONS.newsletterIssues,
    COLLECTIONS.offices,
    COLLECTIONS.seo,
    COLLECTIONS.theme,
    COLLECTIONS.themePresets,
    COLLECTIONS.navigation,
  ];

  for (const name of collectionsToScan) {
    try {
      const snap = await getDocs(collection(db, name));
      for (const d of snap.docs) {
        walkForMediaUrls(d.data(), used);
      }
    } catch {
      /* collection may be empty / denied */
    }
  }

  return used;
}

const MEDIA_KEY =
  /(url|image|logo|photo|cover|banner|hero|media|src|background|favicon|og|thumbnail|avatar|icon)/i;

function walkForMediaUrls(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return;
    if (
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      (v.startsWith("/") && /\.(webp|png|jpe?g|gif|svg|mp4|webm|pdf)(\?|$)/i.test(v))
    ) {
      out.add(v);
      // Also index decoded Storage path fragments for matching
      try {
        const u = new URL(v);
        const match = /\/o\/([^?]+)/.exec(u.pathname);
        if (match?.[1]) {
          out.add(decodeURIComponent(match[1]));
        }
      } catch {
        /* not a URL */
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkForMediaUrls(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (typeof child === "string") {
        if (MEDIA_KEY.test(key) || child.includes("firebasestorage") || child.includes("storage.googleapis")) {
          walkForMediaUrls(child, out);
        }
      } else {
        walkForMediaUrls(child, out);
      }
    }
  }
}

function assetIsUsed(asset: MediaAsset, used: Set<string>) {
  if (asset.url && used.has(asset.url)) return true;
  if (asset.path && used.has(asset.path)) return true;
  if (asset.url || asset.path) {
    for (const u of used) {
      if (typeof u !== "string") continue;
      if (asset.path && (u === asset.path || u.includes(asset.path))) return true;
      if (asset.url && u === asset.url) return true;
      if (asset.path && u.includes(encodeURIComponent(asset.path))) return true;
    }
  }
  return false;
}

/** List media for the library UI, with used/unused flags. */
export async function listMediaLibrary(folder?: string | "all"): Promise<MediaLibraryItem[]> {
  const folderFilter = !folder || folder === "all" ? undefined : folder;
  const [items, used] = await Promise.all([listMedia(folderFilter), collectUsedMediaUrls()]);
  return items.map((asset) => ({
    ...asset,
    used: assetIsUsed(asset, used),
    indexed: Boolean(asset.id),
  }));
}

/**
 * Upload a file to Firebase Storage (+ media index in Firestore).
 * Rasters → WebP; SVG kept as SVG. Icons folder uses a smaller max edge.
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
  const forLogo = folder === "logos";
  const forIcon = folder === "icons";
  const stripPlate =
    forLogo || folder === "clients" || folder === "partners" || folder.startsWith("partners/");

  if (isAcceptableImageUpload(file) && shouldConvertToWebp(file)) {
    options?.onPhase?.("converting");
    options?.onProgress?.(5);
    try {
      uploadFile = await convertImageForFirebase(file, {
        forIcon,
        forLogo: forLogo || folder === "clients" || folder === "partners",
        removeBackground: stripPlate,
        liftDarkText: forLogo,
      });
    } catch {
      uploadFile = file;
    }
  } else if (isAcceptableImageUpload(file)) {
    try {
      uploadFile = await convertImageForFirebase(file, {
        forIcon,
        forLogo: forLogo || folder === "clients" || folder === "partners",
        removeBackground: stripPlate,
        liftDarkText: forLogo,
      });
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

/** Delete many unused assets (skips any still referenced). */
export async function deleteUnusedMedia(assets: MediaLibraryItem[]) {
  const unused = assets.filter((a) => !a.used);
  for (const asset of unused) {
    await deleteMedia(asset);
  }
  return unused.length;
}

export function formatBytes(size: number) {
  if (!size || size < 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function knownMediaFolders() {
  return [...MEDIA_FOLDERS];
}
