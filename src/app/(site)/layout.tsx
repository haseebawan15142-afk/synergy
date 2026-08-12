import { Suspense } from "react";
import { headers } from "next/headers";
import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";
import { EventBanner } from "@/components/site/EventBanner";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const overHero = pathname === "/";

  // Do not await CMS before rendering page children — Suspense lets routes stream in parallel.
  return (
    <>
      <CmsThemeStyles />
      <Suspense fallback={<Navbar overHero={overHero} />}>
        <SiteNavbar overHero={overHero} />
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
