"use client";

import Image from "next/image";
import Link from "next/link";
import { partners } from "@/lib/content/partners";
import { cn } from "@/lib/cn";

type CloudBrand = {
  name: string;
  href: string;
  mark: "aws" | "azure" | "google-cloud";
};

type TickerItem =
  | ({ kind: "cloud" } & CloudBrand)
  | ({ kind: "partner" } & (typeof partners)[number]);

const cloudBrands: CloudBrand[] = [
  { name: "Amazon Web Services", href: "https://aws.amazon.com/", mark: "aws" },
  { name: "Microsoft Azure", href: "https://azure.microsoft.com/", mark: "azure" },
  { name: "Google Cloud", href: "https://cloud.google.com/", mark: "google-cloud" },
];

const tickerItems: TickerItem[] = [
  ...cloudBrands.map((item) => ({ kind: "cloud" as const, ...item })),
  ...partners.map((item) => ({ kind: "partner" as const, ...item })),
];

function CloudMark({ mark, className }: { mark: CloudBrand["mark"]; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  if (mark === "aws") {
    return (
      <svg {...props}>
        <path
          d="M14 32c8 3 18 2 24-2-2 3-7 6-13 6-5 0-9-2-11-4Z"
          fill="currentColor"
          className="text-[#FF9900]"
        />
        <path
          d="M10 28c0-10 8-18 18-18 6 0 11 3 14 7-6-3-13-2-18 2-4 3-6 7-6 9Z"
          fill="currentColor"
          className="text-[#252F3E] dark:text-slate-300"
        />
      </svg>
    );
  }

  if (mark === "azure") {
    return (
      <svg {...props}>
        <path d="M12 34 24 8l12 26H12Z" fill="currentColor" className="text-[#0089D6]" />
        <path d="M16 34h16L24 18 16 34Z" fill="currentColor" className="text-[#50E6FF]" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path
        d="M30 22a6 6 0 1 0-10.4-6A8 8 0 1 0 14 30h18a6 6 0 0 0-2-8Z"
        fill="currentColor"
        className="text-[#4285F4]"
      />
      <path
        d="M18 32h16a6 6 0 0 0 .5-12 7 7 0 0 0-13.2 2.5A5.5 5.5 0 0 0 18 32Z"
        fill="currentColor"
        className="text-[#34A853]"
      />
    </svg>
  );
}

function TickerLogo({ item }: { item: TickerItem }) {
  if (item.kind === "partner") {
    return (
      <Link
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-16 w-40 shrink-0 items-center justify-center px-4 sm:h-20 sm:w-44"
        aria-label={item.name}
      >
        <Image
          src={item.logo}
          alt=""
          width={176}
          height={72}
          className="max-h-10 w-auto max-w-[9rem] object-contain opacity-70 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-12"
        />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-16 w-40 shrink-0 flex-col items-center justify-center gap-1 px-4 sm:h-20 sm:w-44"
      aria-label={item.name}
    >
      <CloudMark
        mark={item.mark}
        className="h-9 w-9 opacity-60 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0 sm:h-10 sm:w-10"
      />
      <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-muted opacity-70 transition duration-500 group-hover:opacity-100">
        {item.name.split(" ").slice(0, 2).join(" ")}
      </span>
    </Link>
  );
}

function TickerTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-6 pr-6"
      aria-hidden={ariaHidden || undefined}
    >
      {tickerItems.map((item) => (
        <TickerLogo key={`${item.kind}-${item.kind === "cloud" ? item.mark : item.name}`} item={item} />
      ))}
    </div>
  );
}

export function PartnerTicker() {
  return (
    <section
      className="overflow-hidden border-y border-border/60 bg-surface-muted/40 py-12 sm:py-14"
      aria-labelledby="partner-ticker-heading"
    >
      <div className="page-container mb-8 sm:mb-10">
        <h2
          id="partner-ticker-heading"
          className="text-center text-section-title font-display font-bold text-ink"
        >
          Our Certified Ecosystem
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-body sm:text-base">
          Trusted technology alliances across cloud, data, security, and enterprise infrastructure.
        </p>
      </div>

      <div
        className={cn(
          "relative overflow-hidden",
          "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        )}
      >
        <div className="flex w-max animate-partner-ticker items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
          <TickerTrack />
          <TickerTrack ariaHidden />
        </div>
      </div>
    </section>
  );
}
