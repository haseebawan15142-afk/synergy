import { Suspense } from "react";
import { headers } from "next/headers";
import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";
import { EventBanner } from "@/components/site/EventBanner";
import { PageEnter } from "@/components/motion/PageEnter";

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
      <main
        className={
          overHero
            ? "site-nebula min-w-0 flex-1"
            : "site-nebula min-w-0 flex-1 pt-[4.25rem] sm:pt-[4.5rem]"
        }
      >
        <PageEnter>{children}</PageEnter>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <ClientEffects />
    </>
  );
}
