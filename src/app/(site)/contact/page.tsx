import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { officeLocationsDetailed } from "@/lib/content/company-profile";
import { fetchSiteSettings } from "@/lib/cms/public";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Synergy Computers — Karachi HQ, branches across Pakistan, and Middle East presence.",
};

export default async function ContactPage() {
  const settings = await fetchSiteSettings();

  const offices = officeLocationsDetailed.map((office) => {
    if (office.id !== "karachi") return office;
    return {
      ...office,
      addressLines: [
        settings.addressLine || office.addressLines[0],
        [settings.addressCity, settings.addressCountry].filter(Boolean).join(", ") ||
          office.addressLines[1],
      ].filter(Boolean),
      phones: settings.phones?.length ? settings.phones : office.phones,
      fax: settings.fax || office.fax,
      email: settings.email || office.email,
    };
  });

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Reach our team for sales, support, and project inquiries."
      />
      <div className="page-container section-y-tight grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ContactForm />
        <div className="space-y-5">
          {offices.map((office, index) => (
            <Reveal key={office.id} variant="slideFromRight" delay={index * 0.04}>
              <address className="not-italic rounded-2xl border border-border/80 bg-gradient-to-br from-synergy-muted/60 to-accent-soft/40 p-6 sm:p-7">
                <h2 className="text-lg font-bold text-ink">{office.label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-body">
                  {office.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  {!office.addressLines.some((line) => line === office.country) ? (
                    <span className="block">{office.country}</span>
                  ) : null}
                </p>
                {office.addressPending ? (
                  <p className="mt-3 text-xs text-ink-muted">
                    Street address not printed in Company Profile 2026 — contact us for directions.
                  </p>
                ) : null}
                {office.phones.length > 0 ? (
                  <p className="mt-4 text-sm text-ink-body">Tel: {office.phones.join(", ")}</p>
                ) : null}
                {office.fax ? (
                  <p className="mt-1 text-sm text-ink-body">Fax: {office.fax}</p>
                ) : null}
                <p className="mt-2 text-sm">
                  Email:{" "}
                  <a
                    href={`mailto:${office.email}`}
                    className="font-semibold text-synergy hover:text-synergy-dark"
                  >
                    {office.email}
                  </a>
                </p>
                {office.website ? (
                  <p className="mt-2 text-sm">
                    <a
                      href={office.website}
                      className="font-semibold text-synergy hover:text-synergy-dark"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {office.website.replace(/^https?:\/\//, "")}
                    </a>
                  </p>
                ) : null}
              </address>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
