"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getSiteSettings, saveSiteSettings } from "@/lib/admin/settings";
import {
  COLLECTIONS,
  DEFAULT_SITE_SETTINGS,
  type SiteSettings,
} from "@/lib/firebase/collections";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { MediaUrlField } from "@/components/admin/MediaPicker";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950";

export function WebsiteSettingsForm() {
  const { user, profile } = useAdminAuth();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [phonesText, setPhonesText] = useState(DEFAULT_SITE_SETTINGS.phones.join("\n"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setForm(data);
        setPhonesText((data.phones || []).join("\n"));
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const phones = phonesText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      await saveSiteSettings(
        {
          ...form,
          phones,
        },
        user?.uid,
      );

      await addDoc(collection(getFirebaseDb(), COLLECTIONS.activities), {
        type: "settings.update",
        message: "Updated website settings",
        actorEmail: profile?.email || user?.email || "",
        actorUid: user?.uid || "",
        entity: "settings",
        entityId: "site",
        createdAt: serverTimestamp(),
      });

      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminPageSkeleton />;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Website Settings</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Company identity and contact details stored in Firestore (`settings/site`).
            Company identity, contact details, and shared media stored in Firestore (`settings/site`).
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Company</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Company name">
            <input className={inputClass} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={inputClass} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
          </Field>
          <Field label="Legal name">
            <input className={inputClass} value={form.legalName} onChange={(e) => update("legalName", e.target.value)} />
          </Field>
          <Field label="Copyright">
            <input className={inputClass} value={form.copyright} onChange={(e) => update("copyright", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Company description">
              <textarea
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Mission">
            <textarea rows={3} className={inputClass} value={form.mission} onChange={(e) => update("mission", e.target.value)} />
          </Field>
          <Field label="Vision">
            <textarea rows={3} className={inputClass} value={form.vision} onChange={(e) => update("vision", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Primary phone (display)">
            <input className={inputClass} value={form.phoneDisplay} onChange={(e) => update("phoneDisplay", e.target.value)} />
          </Field>
          <Field label="Primary phone (tel link)">
            <input className={inputClass} value={form.phoneTel} onChange={(e) => update("phoneTel", e.target.value)} />
          </Field>
          <Field label="Business hours">
            <input className={inputClass} value={form.businessHours} onChange={(e) => update("businessHours", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Additional phones (one per line)">
              <textarea rows={3} className={inputClass} value={phonesText} onChange={(e) => setPhonesText(e.target.value)} />
            </Field>
          </div>
          <Field label="Address line">
            <input className={inputClass} value={form.addressLine} onChange={(e) => update("addressLine", e.target.value)} />
          </Field>
          <Field label="City">
            <input className={inputClass} value={form.addressCity} onChange={(e) => update("addressCity", e.target.value)} />
          </Field>
          <Field label="Country">
            <input className={inputClass} value={form.addressCountry} onChange={(e) => update("addressCountry", e.target.value)} />
          </Field>
          <Field label="Google Maps URL">
            <input className={inputClass} value={form.googleMapsUrl} onChange={(e) => update("googleMapsUrl", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Social links</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="LinkedIn">
            <input className={inputClass} value={form.socialLinkedin} onChange={(e) => update("socialLinkedin", e.target.value)} />
          </Field>
          <Field label="Facebook">
            <input className={inputClass} value={form.socialFacebook} onChange={(e) => update("socialFacebook", e.target.value)} />
          </Field>
          <Field label="Twitter / X">
            <input className={inputClass} value={form.socialTwitter} onChange={(e) => update("socialTwitter", e.target.value)} />
          </Field>
          <Field label="Instagram">
            <input className={inputClass} value={form.socialInstagram} onChange={(e) => update("socialInstagram", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Brand media</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MediaUrlField label="Logo" folder="logos" value={form.logoUrl} onChange={(value) => update("logoUrl", value)} />
          <MediaUrlField label="Dark logo" folder="logos" value={form.darkLogoUrl} onChange={(value) => update("darkLogoUrl", value)} />
          <MediaUrlField label="Favicon" folder="logos" value={form.faviconUrl} onChange={(value) => update("faviconUrl", value)} />
          <MediaUrlField label="Footer logo" folder="logos" value={form.footerLogoUrl} onChange={(value) => update("footerLogoUrl", value)} />
          <MediaUrlField label="Hero background" folder="hero" value={form.heroBackgroundUrl} onChange={(value) => update("heroBackgroundUrl", value)} />
          <MediaUrlField label="Company video" folder="hero" value={form.companyVideoUrl} onChange={(value) => update("companyVideoUrl", value)} />
          <MediaUrlField label="Open Graph image" folder="seo" value={form.ogImageUrl} onChange={(value) => update("ogImageUrl", value)} />
        </div>
      </section>
    </form>
  );
}
