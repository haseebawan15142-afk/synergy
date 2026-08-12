import { Navbar } from "@/components/layout/Navbar";
import { fetchSiteSettings } from "@/lib/cms/public-server";

/** Server navbar wired to cached CMS settings (Suspense-friendly). */
export async function SiteNavbar({ overHero = false }: { overHero?: boolean }) {
  const settings = await fetchSiteSettings();
  return (
    <Navbar
      overHero={overHero}
      logoUrl={settings.logoUrl}
      darkLogoUrl={settings.darkLogoUrl}
      footerLogoUrl={settings.footerLogoUrl}
      companyName={settings.legalName || settings.companyName}
    />
  );
}
