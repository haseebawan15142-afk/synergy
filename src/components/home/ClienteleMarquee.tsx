"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  clienteleHeadline,
  clienteleIntro,
  clients as localClients,
  splitClientColumns,
  type ClientLogo,
} from "@/lib/content/clients";
import { fetchClients } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { cn } from "@/lib/cn";

function ClientCard({ client }: { client: ClientLogo }) {
  return (
    <article
      className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-white px-3 shadow-soft ring-1 ring-border/60 sm:h-28"
      aria-label={client.name}
    >
      <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-synergy" aria-hidden />
      <div className="flex h-full w-full items-center justify-center px-2 py-3">
        <Image
          src={client.logo}
          alt={client.name}
          width={200}
          height={100}
          className="!relative h-12 w-auto max-w-[90%] object-contain sm:h-14"
        />
      </div>
    </article>
  );
}

function VerticalMarquee({
  items,
  reverse,
  durationSec,
}: {
  items: ClientLogo[];
  reverse?: boolean;
  durationSec: number;
}) {
  return (
    <div
      className={cn(
        "client-marquee-track flex w-full flex-col will-change-transform",
        reverse ? "animate-logo-marquee-y-reverse" : "animate-logo-marquee-y",
        "motion-reduce:animate-none",
      )}
      style={{ animationDuration: `${durationSec}s` }}
    >
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className="m-0 flex list-none flex-col gap-3 p-0 pb-3"
          aria-hidden={copy === 1 || undefined}
        >
          {items.map((client) => (
            <li key={`${copy}-${client.slug}`} className="m-0 p-0">
              <ClientCard client={client} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function ClienteleMarquee() {
  const loader = useCallback(() => fetchClients(), []);
  const clients = useCmsList(localClients, loader);
  const columns = splitClientColumns(clients, 3);

  return (
    <section
      id="selected-clientele"
      className="border-y border-border/60 bg-surface-muted section-y"
      aria-labelledby="selected-clientele-heading"
    >
      <div className="page-container grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="mx-auto max-w-lg text-center lg:mx-0 lg:max-w-none lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-synergy">
            Selected Clientele
          </p>
          <h2
            id="selected-clientele-heading"
            className="mt-3 text-section-title font-display font-bold text-ink"
          >
            {clienteleHeadline}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-body sm:text-base">
            {clienteleIntro}
          </p>
        </div>

        <div
          className={cn(
            "relative h-[22rem] w-full overflow-hidden sm:h-[26rem] lg:h-[30rem]",
            "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
            "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
          )}
        >
          <div className="flex h-full gap-3 [&:hover_.client-marquee-track]:[animation-play-state:paused] sm:gap-4">
            {columns.map((column, index) => (
              <div key={`col-${index}`} className="relative min-w-0 flex-1 overflow-hidden">
                <VerticalMarquee
                  items={column}
                  reverse={index % 2 === 1}
                  durationSec={34 + index * 7}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
