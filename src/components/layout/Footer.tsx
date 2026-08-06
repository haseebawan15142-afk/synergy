import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { fetchFooterNav, fetchSiteSettings } from "@/lib/cms/public";

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
          <ul className="mt-4 space-y-3 text-sm">
            {settings.socialLinkedin ? (
              <li>
                <a
                  href={settings.socialLinkedin}
                  className="text-slate-400 transition hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </li>
            ) : null}
            {settings.socialFacebook ? (
              <li>
                <a
                  href={settings.socialFacebook}
                  className="text-slate-400 transition hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-6 text-center text-xs text-slate-500">
        {settings.copyright ||
          `© ${new Date().getFullYear()} ${settings.legalName}. All rights reserved.`}
      </div>
    </footer>
  );
}
