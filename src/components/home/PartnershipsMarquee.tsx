"use client";

import { useCallback, useMemo } from "react";
import { partnershipsIntro } from "@/lib/content/partnership-logos";
import { partners as localPartners } from "@/lib/content/partners";
import { fetchPartners } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { LogoMarquee, type MarqueeLogo } from "@/components/home/LogoMarquee";

function toMarqueeRows(items: MarqueeLogo[]): MarqueeLogo[][] {
  if (!items.length) return [[], []];
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function PartnershipsMarquee() {
  const loader = useCallback(() => fetchPartners(), []);
  const partners = useCmsList(localPartners, loader);

  const rows = useMemo(() => {
    const logos: MarqueeLogo[] = partners
      .filter((p) => p.logo)
      .map((p) => ({
        name: p.name,
        logo: p.logo,
        href: p.slug ? `/partners/${p.slug}` : p.href && p.href !== "#" ? p.href : undefined,
      }));
    return toMarqueeRows(logos);
  }, [partners]);

  return (
    <LogoMarquee
      id="partnerships"
      eyebrow="Partnerships & Collaborations"
      title="Our technology alliances"
      description={partnershipsIntro}
      rows={rows}
      durationSec={40}
      className="bg-[#F5F7FA]"
      footerHref="/partners"
      footerLabel="View all partners"
    />
  );
}
