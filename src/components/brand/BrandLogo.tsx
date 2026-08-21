"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/content/site";
import { cn } from "@/lib/cn";
import { hasBrandLogoSrc, resolveBrandLogoSrc } from "@/lib/brand/logo";

type BrandLogoProps = {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  className?: string;
  /** Direct CMS logo URL (overrides field resolution when set). */
  src?: string | null;
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  companyName?: string | null;
};

/**
 * Header/footer brand mark from Website Settings (CMS). Empty → text brand.
 */
export function BrandLogo({
  variant = "header",
  theme = "light",
  className,
  src,
  logoUrl,
  darkLogoUrl,
  footerLogoUrl,
  companyName,
}: BrandLogoProps) {
  const resolved =
    clean(src) ||
    resolveBrandLogoSrc({ variant, theme, logoUrl, darkLogoUrl, footerLogoUrl });
  const [imageSrc, setImageSrc] = useState(resolved);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setImageSrc(resolved);
    setBroken(false);
  }, [resolved]);

  const label = clean(companyName) || siteConfig.legalName;
  const showImage = hasBrandLogoSrc(imageSrc) && !broken;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 sm:gap-3",
        variant === "header" && "h-11 sm:h-12 lg:h-14",
        className,
      )}
      aria-label={label}
    >
      {showImage ? (
        <Image
          src={imageSrc}
          alt=""
          width={640}
          height={160}
          priority={variant === "header"}
          unoptimized
          onError={() => setBroken(true)}
          className={cn(
            "w-auto shrink-0 object-contain object-left",
            variant === "header" &&
              "h-10 max-h-10 w-auto max-w-[13.5rem] sm:h-11 sm:max-h-11 sm:max-w-[16rem] lg:h-12 lg:max-h-12 lg:max-w-[18rem]",
            variant === "footer" && "h-12 max-h-12 max-w-[16rem]",
          )}
        />
      ) : (
        <div className="flex min-w-0 flex-col justify-center">
          <span
            className={cn(
              "truncate text-lg font-bold leading-none tracking-tight sm:text-xl lg:text-[1.65rem]",
              theme === "dark" ? "text-white" : "text-ink",
            )}
          >
            {shortBrandName(label)}
          </span>
          {brandSubtitle(label) ? (
            <span
              className={cn(
                "mt-0.5 text-[0.45rem] font-medium uppercase leading-tight tracking-[0.16em] sm:text-[0.48rem] sm:tracking-[0.2em] lg:text-[0.52rem]",
                theme === "dark" ? "text-slate-400" : "text-ink-muted",
              )}
            >
              {brandSubtitle(label)}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

function clean(value?: string | null) {
  return String(value || "").trim();
}

function shortBrandName(legal: string) {
  const trimmed = legal.trim();
  if (!trimmed) return "Synergy";
  // "Synergy Computers (Pvt.) Ltd." → "SYNERGY"
  const first = trimmed.split(/\s+/)[0] || trimmed;
  return first.toUpperCase();
}

function brandSubtitle(legal: string) {
  const trimmed = legal.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) return "";
  return parts.slice(1).join(" ");
}
