import { Suspense } from "react";
import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";
import { EventBanner } from "@/components/site/EventBanner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Do not await CMS before rendering page children — Suspense lets routes stream in parallel.
  return (
    <>
      <CmsThemeStyles />
      <Suspense fallback={<Navbar />}>
        <SiteNavbar />
      </Suspense>
      <EventBanner />
      <main className="min-w-0 flex-1">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <ClientEffects />
    </>
  );
}
