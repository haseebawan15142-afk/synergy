import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { fetchFooterNav, fetchSiteSettings } from "@/lib/cms/public";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export async function Footer() {
  const [settings, companyLinks] = await Promise.all([
    fetchSiteSettings(),
    fetchFooterNav(),
  ]);

  const phones = settings.phones?.length
    ? settings.phones
    : settings.phoneDisplay
      ? [settings.phoneDisplay]
      : [];
  const fax = settings.fax?.trim();

  const socialLinkClass =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-synergy-light transition hover:border-synergy-light/50 hover:bg-synergy/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synergy-light";

  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-dark text-slate-300">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-synergy/20 via-transparent to-accent/10"
        aria-hidden
      />
      <div className="page-container relative grid gap-8 py-12 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-4 lg:gap-10 lg:py-16">
        <div className="lg:col-span-2">
          <BrandLogo variant="footer" theme="dark" className="mb-5" />
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            {settings.addressLine}
            {settings.addressCity ? `, ${settings.addressCity}` : ""}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Offices: Karachi, Islamabad, Lahore, Gilgit · Middle East: Ras Al Khaimah
          </p>
          {phones.length > 0 ? (
            <p className="mt-3 text-sm text-slate-400">Tel: {phones.join(" · ")}</p>
          ) : null}
          {fax ? <p className="mt-1 text-sm text-slate-400">Fax: {fax}</p> : null}
          {settings.email ? (
            <p className="mt-2 text-sm">
              <a
                href={`mailto:${settings.email}`}
                className="font-medium text-synergy-light hover:text-white"
              >
                {settings.email}
              </a>
            </p>
          ) : null}
          <div className="mt-6 max-w-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-synergy-light">
              Newsletter
            </h3>
            <p className="mt-2 text-sm text-slate-400">Get updates on IT insights and company news.</p>
            <NewsletterForm className="mt-3" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-synergy-light">Company</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link.id || link.href}>
                <Link href={link.href} className="text-slate-400 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-synergy-light">Connect</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {settings.socialLinkedin ? (
              <a
                href={settings.socialLinkedin}
                className={socialLinkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Synergy Computers on LinkedIn"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            ) : null}
            {settings.socialFacebook ? (
              <a
                href={settings.socialFacebook}
                className={socialLinkClass}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Synergy Computers on Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-6 text-center text-xs text-slate-500">
        {settings.copyright ||
          `© ${new Date().getFullYear()} ${settings.legalName}. All rights reserved.`}
      </div>
    </footer>
  );
}
