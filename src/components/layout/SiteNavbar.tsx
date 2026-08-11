import { Navbar } from "@/components/layout/Navbar";
import { fetchSiteSettings } from "@/lib/cms/public-server";

/** Server navbar wired to cached CMS settings (Suspense-friendly). */
export async function SiteNavbar() {
  const settings = await fetchSiteSettings();
  return (
    <Navbar
      logoUrl={settings.logoUrl}
      darkLogoUrl={settings.darkLogoUrl}
      footerLogoUrl={settings.footerLogoUrl}
      companyName={settings.legalName || settings.companyName}
    />
  );
}
