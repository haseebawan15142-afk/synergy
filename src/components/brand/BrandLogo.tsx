"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/content/site";
import { cn } from "@/lib/cn";
import {
  DEFAULT_BRAND_MARK,
  isCustomBrandLogo,
  resolveBrandLogoSrc,
} from "@/lib/brand/logo";

type BrandLogoProps = {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  className?: string;
  /** CMS logo URL from Website Settings (falls back to built-in mark). */
  src?: string | null;
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  companyName?: string | null;
};

/**
 * Header/footer brand mark.
 * Admin → Website Settings logo fields override the built-in `/brand/scl-mark.png`.
 * Custom uploads render as a full logo image; the default mark keeps the SYNERGY wordmark.
 * If a Firebase/CMS logo fails to load, swaps to the bundled mark automatically.
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
  const [imageSrc, setImageSrc] = useState(resolved || DEFAULT_BRAND_MARK);

  useEffect(() => {
    setImageSrc(resolved || DEFAULT_BRAND_MARK);
  }, [resolved]);

  const custom = isCustomBrandLogo(imageSrc);
  const label = clean(companyName) || siteConfig.legalName;
  const markHeight = variant === "footer" ? 44 : undefined;

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2 sm:gap-3", className)}
      aria-label={label}
    >
      <Image
        src={imageSrc || DEFAULT_BRAND_MARK}
        alt=""
        width={custom ? 480 : 333}
        height={custom ? 160 : 134}
        priority={variant === "header"}
        unoptimized
        onError={() => {
          if (imageSrc !== DEFAULT_BRAND_MARK) setImageSrc(DEFAULT_BRAND_MARK);
        }}
        className={cn(
          "w-auto shrink-0 object-contain object-left",
          variant === "header" && (custom ? "h-9 sm:h-10 lg:h-11" : "h-8 sm:h-9 lg:h-10"),
          variant === "footer" && (custom ? "h-12 max-h-12" : "h-11"),
          custom && "max-w-[11rem] sm:max-w-[13rem] lg:max-w-[15rem]",
        )}
        style={
          variant === "footer"
            ? {
                height: markHeight,
                maxHeight: markHeight,
                filter: custom
                  ? undefined
                  : "contrast(1.15) saturate(1.35) brightness(1.02)",
              }
            : {
                filter: custom
                  ? undefined
                  : "contrast(1.15) saturate(1.35) brightness(1.02)",
              }
        }
      />
      {!custom ? (
        <div
          className={cn(
            "flex min-w-0 flex-col justify-center border-l pl-2 sm:pl-2.5 lg:pl-3",
            theme === "dark" ? "border-white/20" : "border-border",
          )}
        >
          <span
            className={cn(
              "truncate text-lg font-bold leading-none tracking-tight sm:text-xl lg:text-[1.65rem]",
              theme === "dark" ? "text-white" : "text-ink",
            )}
          >
            SYNERGY
          </span>
          <span
            className={cn(
              "mt-0.5 text-[0.45rem] font-medium uppercase leading-tight tracking-[0.16em] sm:text-[0.48rem] sm:tracking-[0.2em] lg:text-[0.52rem]",
              theme === "dark" ? "text-slate-400" : "text-ink-muted",
            )}
          >
            Computers (PVT) Ltd
          </span>
        </div>
      ) : null}
    </div>
  );
}

function clean(value?: string | null) {
  return String(value || "").trim();
}
