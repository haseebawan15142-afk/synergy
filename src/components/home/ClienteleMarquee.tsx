"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import {
  clienteleHeadlineSlides,
  clienteleIntro,
  clients as localClients,
  orderedClientsForShowcase,
  paginateClients,
  type ClientLogo,
} from "@/lib/content/clients";
import { fetchClients } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { ResilientImage } from "@/components/media/ResilientImage";

function ClientCard({ client }: { client: ClientLogo }) {
  const localLogo = localClients.find((c) => c.slug === client.slug)?.logo;
  return (
    <article
      className="digital-card relative flex aspect-[5/3.4] items-center justify-center overflow-hidden p-3 sm:p-4"
      aria-label={client.name}
    >
      <span
        className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-synergy shadow-[0_0_10px_rgba(124,58,237,0.9)]"
        aria-hidden
      />
      <div className="relative z-[1] flex h-full w-full items-center justify-center px-2 py-2">
        <ResilientImage
          src={client.logo}
          fallbackSrc={localLogo}
          alt={client.name}
          width={220}
          height={100}
          className="!relative h-10 w-auto max-w-[88%] object-contain sm:h-12"
        />
      </div>
    </article>
  );
}

function HeadlineBlock({
  line1,
  line2,
  highlight,
}: {
  line1: string;
  line2: string;
  highlight: string;
}) {
  const highlightIndex = line2.toLowerCase().lastIndexOf(highlight.toLowerCase());
  const before =
    highlightIndex >= 0 ? line2.slice(0, highlightIndex) : line2;
  const match =
    highlightIndex >= 0
      ? line2.slice(highlightIndex, highlightIndex + highlight.length)
      : "";
  const after =
    highlightIndex >= 0 ? line2.slice(highlightIndex + highlight.length) : "";

  return (
    <h2
      id="selected-clientele-heading"
      className="mt-4 font-display text-[1.85rem] font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]"
    >
      <span className="block">{line1}</span>
      <span className="mt-1 block">
        {before}
        {match ? (
          <span className="font-semibold text-[#f5d0fe]">{match}</span>
        ) : null}
        {after}
      </span>
    </h2>
  );
}

export function ClienteleMarquee() {
  const reduce = useReducedMotion();
  const loader = useCallback(() => fetchClients(), []);
  const clients = useCmsList(localClients, loader);
  const ordered = useMemo(() => orderedClientsForShowcase(clients), [clients]);
  /** Three CEO slides × 12 logos — matches reference pagination 01 / 03. */
  const pages = useMemo(
    () => paginateClients(ordered.slice(0, 12 * clienteleHeadlineSlides.length)),
    [ordered],
  );
  const pageCount = clienteleHeadlineSlides.length;
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next: number) => {
      setIndex(((next % pageCount) + pageCount) % pageCount);
    },
    [pageCount],
  );

  useEffect(() => {
    if (reduce || pageCount < 2) return;
    const id = window.setInterval(() => go(index + 1), 7000);
    return () => window.clearInterval(id);
  }, [reduce, pageCount, go, index]);

  const slide = clienteleHeadlineSlides[index] ?? clienteleHeadlineSlides[0];
  const pageClients = pages[index] ?? pages[0] ?? [];

  return (
    <section
      id="selected-clientele"
      className="relative overflow-hidden border-y border-synergy/25 bg-[#05030A] section-y"
      aria-labelledby="selected-clientele-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 8% 88%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(ellipse 40% 35% at 92% 12%, rgba(192,38,211,0.14), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-0 h-40 w-56 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(167,139,250,0.55) 1px, transparent 1.5px)",
          backgroundSize: "14px 10px",
          maskImage: "linear-gradient(to top right, black, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="page-container relative">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-0">
          <div className="flex flex-col justify-center lg:pr-10 xl:pr-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
                Selected Clientele
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slide.line1}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <HeadlineBlock {...slide} />
                </motion.div>
              </AnimatePresence>
              <p className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-synergy/40 bg-synergy/15 text-[#c4b5fd]">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span>{clienteleIntro}</span>
              </p>
            </div>
          </div>

          <div className="relative lg:border-l lg:border-synergy/35 lg:pl-10 xl:pl-12">
            <span
              className="pointer-events-none absolute left-0 top-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-synergy shadow-[0_0_18px_rgba(124,58,237,0.95)] lg:block"
              aria-hidden
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={`page-${index}`}
                initial={reduce ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5 lg:grid-cols-4"
              >
                {pageClients.map((client) => (
                  <li key={`${index}-${client.slug}`} className="m-0 list-none p-0">
                    <ClientCard client={client} />
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
