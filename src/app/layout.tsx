import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteConfig } from "@/lib/content/site";
import { fetchSiteSettings } from "@/lib/cms/public";
import { resolveFaviconUrl, resolveOgImageUrl } from "@/lib/brand/logo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const name = settings.companyName?.trim() || siteConfig.name;
  const description = settings.description?.trim() || siteConfig.description;
  const favicon = resolveFaviconUrl(settings);
  const ogImage = resolveOgImageUrl(settings);

  return {
    title: {
      default: settings.defaultSeoTitle?.trim() || `${name} | IT Solutions Pakistan`,
      template: `%s | ${name}`,
    },
    description: settings.defaultSeoDescription?.trim() || description,
    metadataBase: new URL(siteConfig.url),
    icons: { icon: favicon },
    openGraph: {
      title: name,
      description,
      url: siteConfig.url,
      siteName: name,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
