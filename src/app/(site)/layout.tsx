import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CmsThemeStyles } from "@/components/cms/CmsThemeStyles";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CmsThemeStyles />
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
      <ClientEffects />
    </>
  );
}
