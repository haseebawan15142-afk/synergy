import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientEffects } from "@/components/layout/ClientEffects";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteConfig } from "@/lib/content/site";
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

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | IT Solutions Pakistan`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  icons: { icon: "/brand/favicon.png" },
};

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
        <ThemeProvider>
          <Navbar />
          <main className="min-w-0 flex-1">{children}</main>
          <Footer />
          <ClientEffects />
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
