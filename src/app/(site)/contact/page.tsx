import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { OfficesMap } from "@/components/contact/OfficesMap";
import { DEFAULT_SITE_SETTINGS } from "@/lib/firebase/collections";
import { fetchOffices, fetchSiteSettings } from "@/lib/cms/public";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Synergy Computers — Karachi HQ, branches across Pakistan, and Middle East presence.",
};

/** Pick up admin CMS contact / office changes without a full redeploy. */
export const revalidate = 30;

export default async function ContactPage() {
  const [settings, cmsOffices] = await Promise.all([fetchSiteSettings(), fetchOffices()]);

  const offices = cmsOffices.map((office) => {
    if (office.id !== "karachi" && !office.isHeadOffice) return office;
    // HQ fields can be overridden from Website Settings
    const cityLine = [settings.addressCity, settings.addressCountry].filter(Boolean).join(", ");
    return {
      ...office,
      addressLines: [
        settings.addressLine || office.addressLines[0],
        ...(cityLine ? [cityLine] : office.addressLines.slice(1)),
      ].filter(Boolean),
      phones: settings.phones?.length ? settings.phones : office.phones,
      fax: settings.fax || office.fax,
      email: settings.email || office.email,
    };
  });

  const title = settings.contactTitle || DEFAULT_SITE_SETTINGS.contactTitle || "Contact us";
  const description =
    settings.contactDescription ||
    DEFAULT_SITE_SETTINGS.contactDescription ||
    "Reach our team for sales, support, and project inquiries.";
  const formIntro =
    settings.contactFormIntro || DEFAULT_SITE_SETTINGS.contactFormIntro || undefined;
  const aside =
    settings.contactAsideText || DEFAULT_SITE_SETTINGS.contactAsideText || undefined;

  return (
    <>
      <ContactHero title={title} description={description}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/20 bg-white/55 p-5 shadow-card backdrop-blur-md sm:p-6 dark:bg-slate-950/50">
            <ContactForm intro={formIntro} bare />
          </div>
          <div className="rounded-2xl border border-white/15 bg-ink/35 px-5 py-4 backdrop-blur-sm sm:px-6">
            {aside ? (
              <p className="text-sm leading-relaxed text-white/85">{aside}</p>
            ) : (
              <p className="text-sm leading-relaxed text-white/85">
                Prefer to talk directly? Email or call — we&apos;ll connect you with the right
                specialist.
              </p>
            )}
            {settings.email || settings.phoneDisplay ? (
              <ul className="mt-3 space-y-1.5 text-sm text-white/90">
                {settings.email ? (
                  <li>
                    Email:{" "}
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-semibold text-synergy-glow hover:underline"
                    >
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.phoneDisplay ? (
                  <li>
                    Tel:{" "}
                    <a
                      href={`tel:${settings.phoneTel || settings.phoneDisplay}`}
                      className="font-semibold text-synergy-glow hover:underline"
                    >
                      {settings.phoneDisplay}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>
      </ContactHero>

      <div className="page-container section-y-tight">
        <div className="mt-4 border-t border-border/60 pt-12 sm:mt-6 sm:pt-14">
          <OfficesMap offices={offices} />
        </div>
      </div>
    </>
  );
}
