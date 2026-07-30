import Image from "next/image";
import { siteConfig } from "@/lib/content/site";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  variant?: "header" | "footer";
  theme?: "light" | "dark";
  className?: string;
};

/** Official SCL mark (PNG) + SYNERGY wordmark — mark sourced from brand assets, transparent background. */
export function BrandLogo({ variant = "header", theme = "light", className }: BrandLogoProps) {
  const markHeight = variant === "footer" ? 44 : undefined;

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2 sm:gap-3", className)}
      aria-label={siteConfig.legalName}
    >
      <Image
        src="/brand/scl-mark.png"
        alt=""
        width={333}
        height={134}
        priority={variant === "header"}
        unoptimized
        className={cn(
          "w-auto shrink-0 object-contain object-left",
          variant === "header" && "h-8 sm:h-9 lg:h-10",
          variant === "footer" && "h-11",
        )}
        style={
          variant === "footer"
            ? { height: markHeight, maxHeight: markHeight, filter: "contrast(1.15) saturate(1.35) brightness(1.02)" }
            : { filter: "contrast(1.15) saturate(1.35) brightness(1.02)" }
        }
      />
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
    </div>
  );
}
