"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, Users, Award, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

const icons: Record<string, LucideIcon> = {
  building: Building2,
  users: Users,
  award: Award,
};

export type NavDropdownItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

type NavDropdownProps = {
  label: string;
  href: string;
  items: readonly NavDropdownItem[];
  active?: boolean;
  linkClassName?: string;
};

export function NavDropdown({ label, href, items, active, linkClassName }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

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
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={href}
        aria-expanded={open}
        className={cn(
          "relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4",
          active
            ? "bg-synergy-muted text-synergy-light dark:text-synergy-glow"
            : "text-ink-body hover:bg-surface-muted hover:text-ink",
          linkClassName,
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
          <motion.div
            role="menu"
            aria-label={`${label} submenu`}
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: motionDurations.hover, ease: motionEase }}
            className="absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 pt-3"
          >
            <div className="overflow-hidden rounded-xl border border-border/70 bg-surface-elevated shadow-card">
              <ul className="p-2">
                {items.map((item) => {
                  const Icon = item.icon ? icons[item.icon] : undefined;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        role="menuitem"
                        className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-surface-muted"
                      >
                        {Icon ? (
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-synergy-muted text-synergy-dark dark:text-synergy-glow">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                        ) : null}
                        <span>
                          <span className="block text-sm font-semibold text-ink">{item.label}</span>
                          {item.description ? (
                            <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
