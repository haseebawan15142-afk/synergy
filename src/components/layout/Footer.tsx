import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { siteConfig } from "@/lib/content/site";

export function Footer() {
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
            {siteConfig.address.line}, {siteConfig.address.city}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Offices: Karachi, Islamabad, Lahore, Gilgit · Middle East: Ras Al Khaimah
          </p>
          <p className="mt-3 text-sm text-slate-400">Tel: {siteConfig.phones.join(" · ")}</p>
          <p className="mt-1 text-sm text-slate-400">Fax: {siteConfig.fax}</p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-synergy-light hover:text-white"
            >
              {siteConfig.email}
            </a>
          </p>
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
            {[
              { href: "/about", label: "About" },
              { href: "/services", label: "Services" },
              { href: "/partners", label: "Partners" },
              { href: "/resources", label: "Resources" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
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
            <li>
              <a
                href={siteConfig.social.linkedin}
                className="text-slate-400 transition hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.facebook}
                className="text-slate-400 transition hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
