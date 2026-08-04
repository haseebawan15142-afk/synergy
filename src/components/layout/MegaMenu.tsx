"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, Users, Award, Landmark, ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";
import type { MegaMenuConfig } from "@/lib/content/nav-menus";

const icons: Record<string, LucideIcon> = {
  building: Building2,
  users: Users,
  award: Award,
  landmark: Landmark,
};

type MegaMenuProps = {
  label: string;
  href: string;
  menu: MegaMenuConfig;
  active?: boolean;
};

export function MegaMenu({ label, href, menu, active }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();
  const FeaturedIcon = menu.featured.icon ? icons[menu.featured.icon] : undefined;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    /* Not position:relative — panel is centered to the header page-container. */
    <div onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={href}
        aria-expanded={open}
        className={cn(
          "relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4",
          active
            ? "bg-synergy-muted text-synergy-light dark:text-synergy-glow"
            : "text-ink-body hover:bg-surface-muted hover:text-ink",
        )}
        onFocus={handleEnter}
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={cn("mt-px transition-transform duration-200", open && "rotate-180")}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <AnimatePresence>
        {open ? (
          /* Outer shell owns centering transform; Framer Motion animates only the inner layer. */
          <div className="absolute left-1/2 top-full z-50 w-[min(52rem,calc(100vw-2rem))] -translate-x-1/2 pt-3">
            <motion.div
              role="menu"
              aria-label={`${label} submenu`}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: motionDurations.hover, ease: motionEase }}
            >
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated shadow-card">
                <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                  {/* Featured column */}
                  <Link
                    href={menu.featured.href}
                    role="menuitem"
                    className="group flex flex-col justify-between gap-4 border-r border-border/60 bg-surface-muted/60 p-6 transition-colors hover:bg-synergy-muted/40"
                  >
                    <div>
                      {menu.featured.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={menu.featured.image}
                          alt=""
                          className="mb-4 h-28 w-full rounded-lg object-cover"
                        />
                      ) : FeaturedIcon ? (
                        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-synergy-muted text-synergy-dark dark:text-synergy-glow">
                          <FeaturedIcon className="h-5 w-5" aria-hidden />
                        </span>
                      ) : null}
                      {menu.featured.eyebrow ? (
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-synergy">
                          {menu.featured.eyebrow}
                        </p>
                      ) : null}
                      <h3 className="mt-1.5 text-base font-bold leading-snug text-ink">{menu.featured.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{menu.featured.description}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-synergy">
                      {menu.featured.ctaLabel}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>

                  {/* Link columns */}
                  <div
                    className={cn(
                      "grid gap-x-6 p-6",
                      menu.columns.length > 1 ? "grid-cols-2" : "grid-cols-1",
                    )}
                  >
                    {menu.columns.map((column, colIndex) => (
                      <div key={`${column.heading}-${colIndex}`}>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                          {column.heading}
                        </p>
                        <ul className="mt-3 space-y-0.5">
                          {column.links.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                role="menuitem"
                                className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-medium text-ink-body transition-colors hover:bg-surface-muted hover:text-ink"
                              >
                                <span>{link.label}</span>
                                <ArrowRight
                                  className="h-3.5 w-3.5 shrink-0 text-synergy opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                                  aria-hidden
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
