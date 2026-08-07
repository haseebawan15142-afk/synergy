import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { OfficesMap } from "@/components/contact/OfficesMap";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <PageHeader title={title} description={description} />
      <div className="page-container section-y-tight">
        <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-12">
          <ContactForm intro={formIntro} />
          <div className="mt-10 lg:mt-0">
            {aside ? (
              <p className="text-sm leading-relaxed text-ink-body">{aside}</p>
            ) : null}
            {settings.email || settings.phoneDisplay ? (
              <ul className="mt-4 space-y-1 text-sm text-ink-body">
                {settings.email ? (
                  <li>
                    Email:{" "}
                    <a href={`mailto:${settings.email}`} className="font-semibold text-synergy">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.phoneDisplay ? (
                  <li>
                    Tel:{" "}
                    <a
                      href={`tel:${settings.phoneTel || settings.phoneDisplay}`}
                      className="font-semibold text-synergy"
                    >
                      {settings.phoneDisplay}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="mt-14 border-t border-border/60 pt-12 sm:mt-16 sm:pt-14">
          <OfficesMap offices={offices} />
        </div>
      </div>
    </>
  );
}
