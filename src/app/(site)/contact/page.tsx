import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/lib/content/site";
export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name} — Karachi HQ and branches across Pakistan.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        description="Reach our team for sales, support, and project inquiries."
      />
      <div className="page-container section-y-tight grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ContactForm />
        <Reveal variant="slideFromRight">
          <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-synergy-muted/60 to-accent-soft/40 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink">Head office — Karachi</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-body">
            {siteConfig.address.line}
            <br />
            {siteConfig.address.city}, {siteConfig.address.country}
          </p>
          <p className="mt-4 text-sm text-ink-body">Tel: {siteConfig.phones.join(", ")}</p>
          <p className="mt-2 text-sm">
            Email:{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-semibold text-synergy hover:text-synergy-dark">
              {siteConfig.email}
            </a>
          </p>
          <p className="mt-6 text-sm text-ink-muted">
            Additional branches: Lahore, Islamabad, Gilgit — see company profile for addresses.
          </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
