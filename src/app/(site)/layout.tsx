import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";
import { fetchSiteSettings } from "@/lib/cms/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Fetch on the server so the CMS logo is in the first HTML paint (no default→new flash).
  const settings = await fetchSiteSettings();

  return (
    <>
      <CmsThemeStyles />
      <Navbar
        logoUrl={settings.logoUrl}
        darkLogoUrl={settings.darkLogoUrl}
        companyName={settings.legalName || settings.companyName}
      />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <ClientEffects />
    </>
  );
}
