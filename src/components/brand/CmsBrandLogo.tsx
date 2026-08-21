"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { fetchSiteSettings } from "@/lib/cms/public";

type CmsBrandLogoProps = {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  className?: string;
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  companyName?: string | null;
};

/**
 * BrandLogo wired to Website Settings, with a browser-side refresh so logos
 * still appear when Node SSR cannot reach Firestore (proxy TLS issues).
 */
export function CmsBrandLogo({
  variant = "header",
  theme = "light",
  className,
  logoUrl,
  darkLogoUrl,
  footerLogoUrl,
  companyName,
}: CmsBrandLogoProps) {
  const [cmsLogoUrl, setCmsLogoUrl] = useState(logoUrl);
  const [cmsDarkLogoUrl, setCmsDarkLogoUrl] = useState(darkLogoUrl);
  const [cmsFooterLogoUrl, setCmsFooterLogoUrl] = useState(footerLogoUrl);
  const [cmsCompanyName, setCmsCompanyName] = useState(companyName);

  useEffect(() => {
    setCmsLogoUrl(logoUrl);
    setCmsDarkLogoUrl(darkLogoUrl);
    setCmsFooterLogoUrl(footerLogoUrl);
    setCmsCompanyName(companyName);
  }, [logoUrl, darkLogoUrl, footerLogoUrl, companyName]);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings()
      .then((settings) => {
        if (cancelled) return;
        // Always sync — including empty — so admin “clear logo” is respected.
        setCmsLogoUrl(settings.logoUrl || "");
        setCmsDarkLogoUrl(settings.darkLogoUrl || "");
        setCmsFooterLogoUrl(settings.footerLogoUrl || "");
        const name = settings.legalName || settings.companyName;
        if (name) setCmsCompanyName(name);
      })
      .catch(() => {
        /* keep props */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrandLogo
      variant={variant}
      theme={theme}
      className={className}
      logoUrl={cmsLogoUrl}
      darkLogoUrl={cmsDarkLogoUrl}
      footerLogoUrl={cmsFooterLogoUrl}
      companyName={cmsCompanyName}
    />
  );
}
