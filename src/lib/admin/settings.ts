import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import {
  COLLECTIONS,
  DEFAULT_SITE_SETTINGS,
  DOCS,
  type SiteSettings,
} from "@/lib/firebase/collections";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { requestPublicCmsRevalidate } from "@/lib/cms/revalidate-client";

export function settingsDocRef() {
  return doc(getFirebaseDb(), COLLECTIONS.settings, DOCS.settingsSite);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const snap = await getDoc(settingsDocRef());
  if (!snap.exists()) return { ...DEFAULT_SITE_SETTINGS };
  return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
}

export async function saveSiteSettings(
  data: Partial<SiteSettings>,
  updatedBy?: string,
): Promise<void> {
  await setDoc(
    settingsDocRef(),
    {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy ?? null,
    },
    { merge: true },
  );
  invalidateCmsCache("settings");
  void requestPublicCmsRevalidate(["cms-settings"]);
}
