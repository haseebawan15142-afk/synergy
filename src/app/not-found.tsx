import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you requested could not be found on ${siteConfig.name}.`,
  robots: { index: false, follow: true },
};

const helpfulLinks = [
  { href: "/services", label: "Services" },
  { href: "/partners", label: "Partners" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const;

export default function NotFound() {
  return (
    <>
      <CmsThemeStyles />
      <Suspense fallback={<Navbar />}>
        <SiteNavbar />
      </Suspense>

      <main
        id="main-content"
        className="relative min-w-0 flex-1 overflow-hidden border-b border-border/60 bg-surface-elevated/80"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-synergy/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />

        <div className="page-container relative flex min-h-[min(70vh,36rem)] flex-col items-center justify-center py-16 text-center sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">
            Error 404
          </p>
          <h1 className="font-display text-page-title mt-3 max-w-xl font-bold tracking-tight text-ink">
            Page not found
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-body sm:text-lg">
            The page you requested does not exist, may have moved, or the link may be incorrect.
            Return home or try one of the sections below.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/" size="lg">
              Back to homepage
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Contact us
            </Button>
          </div>

          <nav aria-label="Suggested pages" className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-ink-body">
              {helpfulLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="underline-offset-4 transition hover:text-synergy hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
