"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ResilientImage } from "@/components/media/ResilientImage";

export type MarqueeLogo = {
  name: string;
  logo: string;
  /** Bundled fallback when CMS/Firebase logo fails. */
  fallbackLogo?: string;
  href?: string;
};

type LogoMarqueeProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  rows: MarqueeLogo[][];
  className?: string;
  /** Optional full-bleed section background image. */
  backgroundImage?: string;
  /** Seconds for one full loop (row 0). Opposite row is slightly slower. */
  durationSec?: number;
  /** Optional CTA under the marquee (e.g. View all partners). */
  footerHref?: string;
  footerLabel?: string;
};

function LogoCard({ item }: { item: MarqueeLogo }) {
  const className =
    "relative flex h-[5.5rem] w-[9.75rem] shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-[#05030A]/80 px-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#c4b5fd]/60 sm:h-24 sm:w-44";

  const content = (
    <>
      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-synergy" aria-hidden />
      <ResilientImage
        src={item.logo}
        fallbackSrc={item.fallbackLogo}
        alt=""
        width={180}
        height={72}
        className="max-h-11 w-auto max-w-[8.5rem] object-contain sm:max-h-12 sm:max-w-[10rem]"
      />
      <span className="sr-only">{item.name}</span>
    </>
  );

  if (item.href) {
    const external = item.href.startsWith("http");
    return (
      <Link
        href={item.href}
        className={className}
        aria-label={item.name}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className} role="img" aria-label={item.name}>
      {content}
    </div>
  );
}

function MarqueeRow({
  items,
  reverse,
  durationSec,
  ariaHidden,
}: {
  items: MarqueeLogo[];
  reverse?: boolean;
  durationSec: number;
  ariaHidden?: boolean;
}) {
  const track = (
    <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4">
      {items.map((item) => (
        <LogoCard key={`${item.name}-${item.logo}`} item={item} />
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
      )}
      aria-hidden={ariaHidden || undefined}
    >
      <div
        className={cn(
          "flex w-max items-center",
          reverse ? "animate-logo-marquee-reverse" : "animate-logo-marquee",
          "hover:[animation-play-state:paused] motion-reduce:animate-none",
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {track}
        <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4" aria-hidden>
          {items.map((item) => (
            <LogoCard key={`dup-${item.name}-${item.logo}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LogoMarquee({
  id,
  eyebrow,
  title,
  description,
  rows,
  className,
  backgroundImage,
  durationSec = 42,
  footerHref,
  footerLabel,
}: LogoMarqueeProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-y border-border/60 bg-surface-muted/35 py-12 sm:py-16",
        className,
      )}
      aria-labelledby={`${id}-heading`}
    >
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden
          />
          {/* Heavy scrim so heading/copy stay readable over a busy map */}
          <div className="absolute inset-0 bg-[#05030A]/82" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#05030A]/90 via-[#05030A]/70 to-[#05030A]/88"
            aria-hidden
          />
        </>
      ) : null}

      <div className="page-container relative mb-8 sm:mb-10">
        <div
          className={cn(
            "mx-auto max-w-3xl",
            backgroundImage &&
              "rounded-2xl border border-white/10 bg-[#05030A]/75 px-5 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:px-8 sm:py-7",
          )}
        >
          {eyebrow ? (
            <p
              className={cn(
                "text-center text-xs font-bold uppercase tracking-[0.22em]",
                backgroundImage ? "text-[#e9d5ff]" : "text-synergy",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={`${id}-heading`}
            className={cn(
              "mt-2 text-center text-section-title font-display font-bold",
              backgroundImage ? "text-white" : "text-ink",
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed sm:text-base",
              backgroundImage ? "text-white/90" : "text-ink-body",
            )}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 sm:gap-5">
        {rows.map((row, index) => (
          <MarqueeRow
            key={`${id}-row-${index}`}
            items={row}
            reverse={index % 2 === 1}
            durationSec={durationSec + index * 8}
          />
        ))}
      </div>

      {footerHref && footerLabel ? (
        <div className="page-container relative mt-8 text-center sm:mt-10">
          <Link
            href={footerHref}
            className={cn(
              "inline-flex text-sm font-semibold transition hover:underline",
              backgroundImage ? "text-[#e9d5ff] hover:text-white" : "text-synergy",
            )}
          >
            {footerLabel} →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
