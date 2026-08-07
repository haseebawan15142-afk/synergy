"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Mail, MapPin, Phone, Printer } from "lucide-react";
import {
  internationalOffices,
  officeOsmUrl,
  officesIntro,
  pakistanCityMapPositions,
  pakistanOffices,
  type CityMapPosition,
  type OfficeLocation,
} from "@/lib/content/company-profile";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

function mapPositionFor(office: OfficeLocation): CityMapPosition | null {
  if (typeof office.mapX === "number" && typeof office.mapY === "number") {
    return { left: `${office.mapX}%`, top: `${office.mapY}%` };
  }
  if (office.id in pakistanCityMapPositions) {
    return pakistanCityMapPositions[office.id as keyof typeof pakistanCityMapPositions];
  }
  return null;
}

const PAKISTAN_MAP = "/images/offices/pakistan-map-theme.webp";

function OfficeDetails({ office }: { office: OfficeLocation }) {
  const bgSrc = office.landmark?.background || office.landmark?.image;
  const landmarkAlt = office.landmark
    ? `${office.landmark.name}, ${office.city}`
    : `${office.city} office`;

  return (
    <article className="relative min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.45)] sm:min-h-[24rem]">
      {/* Full-bleed landmark — full color on the right (reference look) */}
      {bgSrc ? (
        <Image
          src={bgSrc}
          alt={landmarkAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover object-[70%_center] brightness-[1.02] contrast-[1.05] saturate-[1.15] sm:object-[75%_center]"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 bg-surface-muted" aria-hidden />
      )}

      {/*
        Reference effect: solid white on the left for copy, fades to clear on the right
        so the landmark stays vivid — not a washed watermark, not a hard split panel.
      */}
      <div
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 48%, rgba(255,255,255,0.55) 72%, rgba(255,255,255,0.12) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 34%, rgba(255,255,255,0.78) 48%, rgba(255,255,255,0.28) 64%, rgba(255,255,255,0.0) 82%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-[22rem] flex-col justify-center p-6 sm:min-h-[24rem] sm:max-w-[56%] sm:p-8 lg:max-w-[52%]">
        <div className="space-y-3.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-synergy">
              {office.isHeadOffice
                ? "Head office"
                : office.country === "Pakistan"
                  ? "Branch"
                  : "International"}
            </p>
            <h3 className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              {office.label}
            </h3>
            {office.landmark ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink-muted">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-synergy" aria-hidden />
                Landmark: {office.landmark.name}
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-ink-body">
            {office.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            {!office.addressLines.some((line) => line === office.country) ? (
              <span className="block">{office.country}</span>
            ) : null}
          </p>

          {office.addressPending ? (
            <p className="text-xs text-ink-muted">
              Street address not printed in Company Profile 2026 — contact us for directions.
            </p>
          ) : null}

          <div className="space-y-2">
            {office.phones.length > 0 ? (
              <p className="flex items-start gap-2 text-sm text-ink-body">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-synergy" aria-hidden />
                <span>{office.phones.join(", ")}</span>
              </p>
            ) : null}
            {office.fax ? (
              <p className="flex items-start gap-2 text-sm text-ink-body">
                <Printer className="mt-0.5 h-4 w-4 shrink-0 text-synergy" aria-hidden />
                <span>Fax: {office.fax}</span>
              </p>
            ) : null}
            <p className="flex items-start gap-2 text-sm">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-synergy" aria-hidden />
              <a
                href={`mailto:${office.email}`}
                className="font-semibold text-synergy hover:underline"
              >
                {office.email}
              </a>
            </p>
          </div>

          <a
            href={officeOsmUrl(office)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-synergy px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-synergy-dark"
          >
            <MapPin className="h-4 w-4" aria-hidden />
            Open in OpenStreetMap
            <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}

export function OfficesMap({ offices }: { offices: OfficeLocation[] }) {
  const reduce = useReducedMotion();
  const pk = offices.filter(
    (o) => o.country === "Pakistan" && o.mapX != null && o.mapY != null,
  );
  const pins = pk.length ? pk : pakistanOffices;
  const international = offices.filter((o) => o.country !== "Pakistan");
  const meList = international.length ? international : internationalOffices;

  const [selectedId, setSelectedId] = useState(pins[0]?.id ?? meList[0]?.id ?? "");
  const selected =
    offices.find((o) => o.id === selectedId) || pins[0] || meList[0] || null;

  return (
    <section id="locations" className="scroll-mt-28" aria-labelledby="locations-heading">
      <Reveal>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-synergy">Our locations</p>
        <h2
          id="locations-heading"
          className="mt-2 text-section-title font-display font-bold text-ink"
        >
          Offices across Pakistan
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-body sm:text-base">
          {officesIntro}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Tap a landmark pin for office details, then open OpenStreetMap for directions.
        </p>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated p-4 shadow-soft sm:rounded-3xl sm:p-6">
            <div className="relative aspect-square h-auto w-full overflow-hidden rounded-xl border border-border/60 bg-surface sm:rounded-2xl">
              <motion.div
                className="absolute inset-[2%] sm:inset-[3%]"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: motionEase }}
              >
                {/* Map + pins share one relative box so % coords track the image on all breakpoints */}
                <div className="relative h-full w-full">
                  <div className="absolute inset-0 rounded-xl bg-surface sm:rounded-2xl" />
                  <Image
                    src={PAKISTAN_MAP}
                    alt="Map of Pakistan with provinces — Synergy office cities"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-contain object-center"
                  />

                  {pins.map((office, index) => {
                    const active = office.id === selectedId;
                    const img = office.landmark?.image;
                    const pos = mapPositionFor(office);
                    if (!pos) return null;

                    return (
                      <div
                        key={office.id}
                        className="absolute z-10"
                        style={{
                          left: pos.left,
                          top: pos.top,
                          transform: "translate(-50%, -100%)",
                        }}
                      >
                        <motion.button
                          type="button"
                          onClick={() => setSelectedId(office.id)}
                          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: active ? 1.08 : 1 }}
                          transition={{
                            delay: reduce ? 0 : 0.15 + index * 0.08,
                            duration: motionDurations.reveal,
                            ease: motionEase,
                          }}
                          whileHover={reduce ? undefined : { scale: 1.12, y: -2 }}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          className={cn(
                            "group flex flex-col items-center",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-synergy focus-visible:ring-offset-2",
                          )}
                          aria-label={`${office.city} office — ${office.landmark?.name ?? office.city}`}
                          aria-pressed={active}
                        >
                          {active ? (
                            <motion.span
                              className="absolute top-3 h-12 w-12 rounded-full bg-synergy/25 sm:top-4 sm:h-14 sm:w-14"
                              initial={{ scale: 0.8, opacity: 0.6 }}
                              animate={{ scale: 1.55, opacity: 0 }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                              aria-hidden
                            />
                          ) : null}

                          <span
                            className={cn(
                              "relative h-12 w-12 overflow-hidden rounded-full border-2 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-colors duration-300 sm:h-14 sm:w-14",
                              active
                                ? "border-synergy ring-4 ring-synergy/20"
                                : "border-white group-hover:border-synergy/70",
                            )}
                          >
                            {img ? (
                              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-synergy-muted">
                                <MapPin className="h-5 w-5 text-synergy" />
                              </span>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: motionDurations.hover, ease: motionEase }}
              >
                <OfficeDetails office={selected} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Reveal>
      </div>

      {meList.length > 0 ? (
        <div className="mt-8 space-y-4 sm:mt-10">
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-synergy">
            International
          </h3>
          <ul className="grid gap-4">
            {meList.map((office) => {
              const active = office.id === selectedId;
              return (
                <li key={office.id}>
                  <motion.button
                    type="button"
                    onClick={() => setSelectedId(office.id)}
                    whileHover={reduce ? undefined : { y: -2 }}
                    className={cn(
                      "flex w-full gap-4 rounded-2xl border p-4 text-left transition-colors duration-300 sm:p-5",
                      "backdrop-blur-md",
                      active
                        ? "border-synergy/50 bg-synergy-muted/50 shadow-soft"
                        : "border-white/70 bg-white/60 hover:border-synergy/35 hover:bg-white/80",
                    )}
                  >
                    {office.landmark?.image ? (
                      <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 sm:h-24 sm:w-24">
                        <Image
                          src={office.landmark.image}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-ink">{office.label}</span>
                      <span className="mt-1 block text-sm text-ink-body">
                        {office.addressLines.slice(0, 2).join(" · ")}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-synergy">
                        <MapPin className="h-4 w-4" aria-hidden />
                        View on map
                      </span>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
