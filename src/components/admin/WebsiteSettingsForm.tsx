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
import { HeroVideoSlotsEditor } from "@/components/admin/HeroVideoSlotsEditor";
import {
  landingHeroSlotsForAdmin,
  normalizeLandingHeroVideos,
} from "@/lib/content/hero-videos";
import {
  SOCIAL_PLATFORMS,
  legacySocialLinks,
  newSocialLink,
  platformLabel,
  syncLegacySocialFields,
  type SocialLink,
  type SocialPlatform,
} from "@/lib/content/social-links";

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

function normalizeSocialLinks(data: SiteSettings): SocialLink[] {
  if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
    return data.socialLinks.map((link) => ({
      ...link,
      id: link.id || `social-${link.platform}-${Math.random().toString(36).slice(2, 8)}`,
      active: link.active !== false,
      iconUrl: link.iconUrl || "",
    }));
  }
  const legacy = legacySocialLinks(data);
  return legacy.length ? legacy : [...(DEFAULT_SITE_SETTINGS.socialLinks || [])];
}

export function WebsiteSettingsForm() {
  const { user, profile } = useAdminAuth();
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [phonesText, setPhonesText] = useState(DEFAULT_SITE_SETTINGS.phones.join("\n"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        setForm({
          ...data,
          socialLinks: normalizeSocialLinks(data),
          heroVideos: landingHeroSlotsForAdmin(data.heroVideos),
        });
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

  function updateSocial(id: string, patch: Partial<SocialLink>) {
    setForm((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map((link) => {
        if (link.id !== id) return link;
        const next = { ...link, ...patch };
        if (patch.platform && patch.label === undefined) {
          next.label = platformLabel(patch.platform);
        }
        return next;
      }),
    }));
  }

  function addSocial() {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newSocialLink("youtube")],
    }));
  }

  function removeSocial(id: string) {
    setForm((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((link) => link.id !== id),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const phones = phonesText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const socialLinks = (form.socialLinks || [])
        .map((link) => ({
          ...link,
          url: String(link.url || "").trim(),
          label: String(link.label || platformLabel(link.platform)).trim(),
          iconUrl: String(link.iconUrl || "").trim(),
          active: link.active !== false,
        }))
        .filter((link) => Boolean(link.url));

      const heroVideos = normalizeLandingHeroVideos(form.heroVideos);

      await saveSiteSettings(
        {
          ...form,
          phones,
          socialLinks,
          heroVideos,
          ...syncLegacySocialFields(socialLinks),
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
            Company identity, contact details, landing hero videos, and brand media. Updates apply across the public site
            (navbar, footer, home hero, partner blocks, browser tab).
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
        <h2 className="text-sm font-semibold">Contact details</h2>
        <p className="mt-1 text-xs text-zinc-500">Used on Contact page, Footer, and office cards (HQ).</p>
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
          <Field label="Fax">
            <input className={inputClass} value={form.fax || ""} onChange={(e) => update("fax", e.target.value)} />
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
        <h2 className="text-sm font-semibold">Contact page copy</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Headlines and helper text on /contact. Office pins are managed under Admin → Offices.
        </p>
        <div className="mt-4 grid gap-4">
          <Field label="Page title">
            <input
              className={inputClass}
              value={form.contactTitle || ""}
              onChange={(e) => update("contactTitle", e.target.value)}
              placeholder="Contact us"
            />
          </Field>
          <Field label="Page description">
            <textarea
              rows={2}
              className={inputClass}
              value={form.contactDescription || ""}
              onChange={(e) => update("contactDescription", e.target.value)}
            />
          </Field>
          <Field label="Form intro (above Send message fields)">
            <textarea
              rows={2}
              className={inputClass}
              value={form.contactFormIntro || ""}
              onChange={(e) => update("contactFormIntro", e.target.value)}
            />
          </Field>
          <Field label="Aside text (next to the form)">
            <textarea
              rows={3}
              className={inputClass}
              value={form.contactAsideText || ""}
              onChange={(e) => update("contactAsideText", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Social links</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Add YouTube, Twitter, Instagram, and more here — no developer change needed. Built-in icons for common
              platforms; optional custom icon upload if you need your own logo.
            </p>
          </div>
          <button
            type="button"
            onClick={addSocial}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Add link
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {(form.socialLinks || []).length === 0 ? (
            <p className="text-sm text-zinc-500">No social links yet. Click “Add link”.</p>
          ) : (
            (form.socialLinks || []).map((link) => (
              <div
                key={link.id}
                className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Platform">
                    <select
                      className={inputClass}
                      value={link.platform}
                      onChange={(e) =>
                        updateSocial(link.id, { platform: e.target.value as SocialPlatform })
                      }
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Label">
                    <input
                      className={inputClass}
                      value={link.label}
                      onChange={(e) => updateSocial(link.id, { label: e.target.value })}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="URL">
                      <input
                        className={inputClass}
                        value={link.url}
                        placeholder="https://"
                        onChange={(e) => updateSocial(link.id, { url: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <MediaUrlField
                      label="Custom icon (optional)"
                      folder="logos"
                      value={link.iconUrl || ""}
                      onChange={(value) => updateSocial(link.id, { iconUrl: value })}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={link.active !== false}
                      onChange={(e) => updateSocial(link.id, { active: e.target.checked })}
                    />
                    Show on site
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSocial(link.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Landing page hero videos</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Default home hero playlist (up to 6 clips). Upload any video format — it converts to MP4 and is stored in
          the media library. Poster images convert to WebP. Event themes still override this playlist when activated.
        </p>
        <div className="mt-4">
          <HeroVideoSlotsEditor
            videos={form.heroVideos || []}
            onChange={(heroVideos) => update("heroVideos", heroVideos)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold">Brand media</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Upload once here — saved to Firebase and used site-wide for header, footer, and favicon.
          Empty fields show the company name as text (no built-in /public logo fallback).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MediaUrlField
            label="Logo (navbar / light backgrounds)"
            folder="logos"
            value={form.logoUrl}
            onChange={(value) => update("logoUrl", value)}
          />
          <MediaUrlField
            label="Dark logo (transparent nav over hero)"
            folder="logos"
            value={form.darkLogoUrl}
            onChange={(value) => update("darkLogoUrl", value)}
          />
          <MediaUrlField
            label="Favicon (browser tab)"
            folder="logos"
            value={form.faviconUrl}
            onChange={(value) => update("faviconUrl", value)}
          />
          <MediaUrlField
            label="Footer logo"
            folder="logos"
            value={form.footerLogoUrl}
            onChange={(value) => update("footerLogoUrl", value)}
          />
          <MediaUrlField
            label="Hero background"
            folder="hero"
            value={form.heroBackgroundUrl}
            onChange={(value) => update("heroBackgroundUrl", value)}
          />
          <MediaUrlField
            label="Company video"
            folder="hero"
            value={form.companyVideoUrl}
            onChange={(value) => update("companyVideoUrl", value)}
          />
          <MediaUrlField
            label="Open Graph image (social share)"
            folder="seo"
            value={form.ogImageUrl}
            onChange={(value) => update("ogImageUrl", value)}
          />
        </div>
      </section>
    </form>
  );
}
