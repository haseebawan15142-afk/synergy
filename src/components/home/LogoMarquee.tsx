"use client";

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
  /** Seconds for one full loop (row 0). Opposite row is slightly slower. */
  durationSec?: number;
  /** Optional CTA under the marquee (e.g. View all partners). */
  footerHref?: string;
  footerLabel?: string;
};

function LogoCard({ item }: { item: MarqueeLogo }) {
  const inner = (
    <>
      <ResilientImage
        src={item.logo}
        fallbackSrc={item.fallbackLogo}
        alt=""
        width={160}
        height={64}
        className="max-h-10 w-auto max-w-[7.5rem] object-contain sm:max-h-12 sm:max-w-[9rem]"
      />
      <span className="sr-only">{item.name}</span>
    </>
  );

  const className =
    "relative flex h-[5.5rem] w-[9.75rem] shrink-0 items-center justify-center rounded-2xl bg-white px-4 shadow-[0_10px_28px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)] sm:h-24 sm:w-44";

  const content = (
    <>
      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-synergy" aria-hidden />
      {inner}
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
  durationSec = 42,
  footerHref,
  footerLabel,
}: LogoMarqueeProps) {
  return (
    <section
      className={cn(
        "overflow-hidden border-y border-border/60 bg-surface-muted/35 py-12 sm:py-16",
        className,
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div className="page-container mb-8 sm:mb-10">
        {eyebrow ? (
          <p className="text-center text-xs font-bold uppercase tracking-[0.22em] text-synergy">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={`${id}-heading`}
          className="mt-2 text-center text-section-title font-display font-bold text-ink"
        >
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-ink-body sm:text-base">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-5">
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
        <div className="page-container mt-8 text-center sm:mt-10">
          <Link
            href={footerHref}
            className="inline-flex text-sm font-semibold text-synergy transition hover:underline"
          >
            {footerLabel} →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
