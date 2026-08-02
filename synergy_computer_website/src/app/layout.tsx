import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { GsapScrollEffects } from "@/components/effects/GsapScrollEffects";
import { PremiumBackdrop } from "@/components/effects/PremiumBackdrop";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { siteConfig } from "@/lib/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <PremiumBackdrop />
          <GsapScrollEffects />
          <Navbar />
          <main className="min-w-0">{children}</main>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
