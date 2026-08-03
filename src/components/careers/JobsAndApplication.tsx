"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Briefcase, MapPin, Send, CheckCircle2 } from "lucide-react";
import { jobOpenings, jobDepartments, jobLocations } from "@/lib/content/careers";
import { siteConfig } from "@/lib/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion/variants";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

const selectClass =
  "rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink shadow-soft transition focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink shadow-soft transition focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20";

function buildMailto(params: {
  name: string;
  email: string;
  phone: string;
  position: string;
  link: string;
  message: string;
}) {
  const subject = `Job Application — ${params.position || "General Application"}`;
  const body = [
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone || "—"}`,
    `Position: ${params.position || "General Application"}`,
    `CV / Portfolio link: ${params.link || "—"}`,
    "",
    "Message:",
    params.message || "—",
  ].join("\n");
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function JobsAndApplication() {
  const reduce = useReducedMotion();
  const [department, setDepartment] = useState<string>("All");
  const [location, setLocation] = useState<string>("All");
  const [position, setPosition] = useState<string>("General Application");
  const [sent, setSent] = useState(false);

  const filtered = useMemo(
    () =>
      jobOpenings.filter(
        (job) =>
          (department === "All" || job.department === department) &&
          (location === "All" || job.location === location),
      ),
    [department, location],
  );

  const selectPosition = (title: string) => {
    setPosition(title);
    setSent(false);
    document.getElementById("apply")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const mailto = buildMailto({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      position,
      link: String(data.get("link") ?? ""),
      message: String(data.get("message") ?? ""),
    });
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <>
      <section
        id="open-positions"
        className="scroll-mt-24 border-t border-border/60 section-y"
        aria-labelledby="open-positions-heading"
      >
        <div className="page-container">
          <Reveal>
            <SectionHeading
              id="open-positions-heading"
              eyebrow="Open Positions"
              title="Current opportunities"
              description="Browse our current openings, or submit a general application if nothing matches right now."
              className="max-w-2xl"
            />
          </Reveal>

          <Reveal variant="fadeUp" delay={0.05}>
            <div className="mt-8 flex flex-wrap gap-2">
              {jobDepartments.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={
                    department === d
                      ? `${selectClass} border-synergy bg-synergy-muted text-synergy-dark dark:text-synergy-glow`
                      : selectClass
                  }
                >
                  {d}
                </button>
              ))}
              <span className="mx-1 hidden w-px self-stretch bg-border sm:block" aria-hidden />
              {jobLocations.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocation(l)}
                  className={
                    location === l
                      ? `${selectClass} border-synergy bg-synergy-muted text-synergy-dark dark:text-synergy-glow`
                      : selectClass
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="mt-6 space-y-3">
            {filtered.length ? (
              filtered.map((job, index) => (
                <Reveal key={job.slug} variant="fadeUp" delay={index * 0.04}>
                  <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-surface-elevated p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-ink">{job.title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" aria-hidden />
                          {job.department}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {job.location}
                        </span>
                        <span className="rounded-full bg-synergy-muted px-2 py-0.5 text-synergy-dark dark:text-synergy-glow">
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => selectPosition(job.title)}>
                      Apply now
                    </Button>
                  </div>
                </Reveal>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-ink-muted">
                No openings match these filters right now — try &quot;All&quot;, or submit a general application below.
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-24 border-t border-border/60 bg-surface-muted/60 section-y">
        <div className="page-container max-w-2xl">
          <Reveal>
            <SectionHeading
              eyebrow="Apply"
              title="Submit your application"
              description="This opens your email app with the details below pre-filled, addressed to our HR team."
            />
          </Reveal>

          <Reveal variant="fadeUp" delay={0.05}>
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl border border-border/80 bg-surface-elevated p-6 shadow-soft sm:p-8"
            >
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    initial={reduce ? false : "hidden"}
                    animate="visible"
                    variants={fadeUp}
                    className="py-6 text-center"
                    role="status"
                  >
                    <motion.div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-synergy-muted text-synergy"
                      initial={reduce ? false : { scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: motionDurations.hover, ease: motionEase }}
                      aria-hidden
                    >
                      <CheckCircle2 className="h-7 w-7" />
                    </motion.div>
                    <p className="mt-4 text-lg font-semibold text-ink">Opening your email app…</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      If it didn&apos;t open automatically, email us directly at{" "}
                      <a href={`mailto:${siteConfig.email}`} className="font-semibold text-synergy hover:underline">
                        {siteConfig.email}
                      </a>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-4 text-sm font-semibold text-synergy hover:underline"
                    >
                      Submit another application
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="fields" initial={false} animate={{ opacity: 1 }}>
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="position" className="block text-sm font-semibold text-ink">
                          Position
                        </label>
                        <input
                          id="position"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-ink">
                            Full name
                          </label>
                          <input id="name" name="name" type="text" required className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-ink">
                            Email
                          </label>
                          <input id="email" name="email" type="email" required className={inputClass} />
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-ink">
                            Phone
                          </label>
                          <input id="phone" name="phone" type="tel" className={inputClass} />
                        </div>
                        <div>
                          <label htmlFor="link" className="block text-sm font-semibold text-ink">
                            CV / portfolio link
                          </label>
                          <input
                            id="link"
                            name="link"
                            type="url"
                            placeholder="Google Drive, LinkedIn, etc."
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-ink">
                          Message (optional)
                        </label>
                        <textarea id="message" name="message" rows={4} className={inputClass} />
                      </div>
                      <Button type="submit" className="w-full sm:w-auto">
                        <Send className="mr-2 h-4 w-4" aria-hidden />
                        Send application
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
