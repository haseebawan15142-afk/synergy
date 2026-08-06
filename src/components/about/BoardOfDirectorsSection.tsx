"use client";

import { useCallback, useMemo } from "react";
import { boardOfDirectors, companyDivisions } from "@/lib/content/company-profile";
import { fetchLeadership } from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

function initials(name: string) {
  return name
    .replace(/^Mr\.\s*/i, "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const localBoard = boardOfDirectors.map((m) => ({
  name: m.name,
  title: m.title,
  bio: "",
  photoSrc: null as string | null,
  linkedin: null as string | null,
}));

export function BoardOfDirectorsSection() {
  const loader = useCallback(() => fetchLeadership(), []);
  const cmsBoard = useCmsList(localBoard, loader);

  const members = useMemo(
    () =>
      cmsBoard.map((m) => ({
        name: m.name,
        title: m.title,
        photoSrc: m.photoSrc,
      })),
    [cmsBoard],
  );

  return (
    <section
      id="board"
      className="scroll-mt-24 border-t border-border/60 bg-surface-muted/40 section-y"
      aria-labelledby="board-heading"
    >
      <div className="page-container">
        <Reveal>
          <SectionHeading
            id="board-heading"
            eyebrow="Governance"
            title="Board of Directors"
            description="As listed in the Synergy Computers Company Profile 2026 — editable from the admin panel."
            className="max-w-2xl"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {members.map((member, index) => (
            <Reveal key={`${member.name}-${index}`} variant="fadeUp" delay={index * 0.06}>
              <div className="flex h-full flex-col items-center rounded-xl border border-border/70 bg-surface-elevated p-6 text-center shadow-soft">
                {member.photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoSrc}
                    alt={member.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-synergy-muted text-lg font-bold text-synergy-dark dark:text-synergy-glow"
                    aria-hidden
                  >
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 text-base font-bold text-ink">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-synergy">{member.title}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal variant="fadeUp" delay={0.1}>
          <div className="mt-10 rounded-xl border border-border/70 bg-surface-elevated p-6 shadow-soft sm:p-8">
            <h3 className="text-base font-bold text-ink">Divisions of the company</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {companyDivisions.map((division) => (
                <li key={division} className="text-sm text-ink-body">
                  {division}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
