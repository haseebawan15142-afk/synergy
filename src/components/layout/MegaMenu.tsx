"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Handshake,
  Headset,
  Landmark,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { focusElement } from "@/lib/a11y/focus";
import { motionDurations, motionEase } from "@/lib/motion/transitions";
import type { MegaMenuConfig, MegaMenuFeatured } from "@/lib/content/nav-menus";
import { NavLinkIcon } from "@/components/layout/NavLinkIcon";
import { ResilientImg } from "@/components/media/ResilientImage";

const featuredIcons: Record<string, LucideIcon> = {
  building: Building2,
  landmark: Landmark,
  handshake: Handshake,
  headset: Headset,
  newspaper: Newspaper,
};

type MegaMenuProps = {
  label: string;
  href: string;
  menu: MegaMenuConfig;
  active?: boolean;
  /** Light text for transparent nav over dark hero media */
  onMedia?: boolean;
};

export function MegaMenu({ label, href, menu, active, onMedia }: MegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [featured, setFeatured] = useState<MegaMenuFeatured>(menu.featured);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const menuId = useId();
  const reduce = useReducedMotion();
  const FeaturedIcon = featured.icon ? featuredIcons[featured.icon] : undefined;

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setFeatured(menu.featured);
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setFeatured(menu.featured);
    }, 120);
  };

  const closeMenu = useCallback(
    (restoreFocus = false) => {
      clearCloseTimer();
      setOpen(false);
      setFeatured(menu.featured);
      if (restoreFocus) {
        requestAnimationFrame(() => focusElement(triggerRef.current));
      }
    },
    [menu.featured],
  );

  useEffect(() => {
    if (!open) setFeatured(menu.featured);
  }, [menu.featured, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMenu(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  const onRootBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    handleLeave();
  };

  const multiCol = menu.columns.length > 1;
  const hasPreviewLinks = menu.columns.some((column) =>
    column.links.some((link) => Boolean(link.preview)),
  );

  return (
    <div
      ref={rootRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={onRootBlur}
    >
      <Link
        ref={triggerRef}
        href={href}
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? `${menuId}-panel` : undefined}
        className={cn(
          "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors xl:px-5",
          onMedia
            ? active || open
              ? "bg-white/15 text-white"
              : "text-white/90 hover:bg-white/10 hover:text-white"
            : active || open
              ? "bg-synergy-muted text-synergy-dark dark:text-synergy-glow"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-ink-body dark:hover:bg-surface-muted dark:hover:text-ink",
          (active || open) &&
            "after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-synergy",
        )}
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
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <AnimatePresence>
        {open ? (
          <div className="absolute left-1/2 top-full z-50 w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 pt-3">
            <motion.div
              id={`${menuId}-panel`}
              role="menu"
              aria-label={`${label} submenu`}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: motionDurations.hover, ease: motionEase }}
            >
              <div
                className="overflow-hidden rounded-2xl border border-white/15 shadow-card"
                style={{
                  background:
                    "linear-gradient(145deg, #0d2818 0%, #1a4d2a 42%, #357c3c 78%, #2d6a34 100%)",
                }}
              >
                <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.65fr)]">
                  <div className="flex flex-col px-6 py-7 sm:px-8">
                    <div
                      className={cn(
                        "grid flex-1 gap-8",
                        multiCol ? "sm:grid-cols-2" : "grid-cols-1",
                      )}
                    >
                      {menu.columns.map((column, colIndex) => (
                        <div key={`${column.heading}-${colIndex}`}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
                            {column.heading.trim() || "Explore"}
                          </p>
                          <div className="mt-2 h-px w-10 bg-white/80" aria-hidden />
                          <ul className="mt-4 space-y-0.5">
                            {column.links.map((link) => {
                              const isPreviewActive =
                                hasPreviewLinks && featured.href === link.href;
                              return (
                                <li key={link.href}>
                                  <Link
                                    href={link.href}
                                    role="menuitem"
                                    onMouseEnter={() => {
                                      if (link.preview) setFeatured(link.preview);
                                    }}
                                    onFocus={() => {
                                      if (link.preview) setFeatured(link.preview);
                                    }}
                                    className={cn(
                                      "group flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
                                      isPreviewActive
                                        ? "bg-white/15 text-white"
                                        : "text-white/90 hover:bg-white/10 hover:text-white",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden text-white transition",
                                        link.logoUrl && "rounded-md bg-white/95 p-1",
                                      )}
                                    >
                                      {link.logoUrl ? (
                                        <ResilientImg
                                          src={link.logoUrl}
                                          alt=""
                                          className="block h-full max-h-6 w-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <NavLinkIcon
                                          href={link.href}
                                          label={link.label}
                                          icon={link.icon}
                                          size={18}
                                        />
                                      )}
                                    </span>
                                    <span className="min-w-0 flex-1 leading-snug">
                                      {link.label}
                                    </span>
                                    <ChevronRight
                                      className={cn(
                                        "h-4 w-4 shrink-0 transition group-hover:translate-x-0.5",
                                        isPreviewActive
                                          ? "text-white"
                                          : "text-white/40 group-hover:text-white",
                                      )}
                                      aria-hidden
                                    />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {menu.seeAll ? (
                      <Link
                        href={menu.seeAll.href}
                        role="menuitem"
                        className="group mt-6 inline-flex items-center gap-2 border-t border-white/20 pt-4 text-sm font-semibold text-white transition hover:text-white/85"
                      >
                        {menu.seeAll.label}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </Link>
                    ) : null}
                  </div>

                  <Link
                    href={featured.href}
                    role="menuitem"
                    className="group flex flex-col justify-between gap-5 border-t border-white/15 bg-black/20 px-6 py-7 transition-colors hover:bg-black/30 sm:px-7 lg:border-l lg:border-t-0"
                  >
                    <div>
                      {featured.image ? (
                        featured.imageContain ? (
                          <div className="mb-4 flex h-16 items-center rounded-lg bg-white px-4 py-3 ring-1 ring-white/15 sm:h-[4.5rem] sm:px-5 sm:py-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              key={featured.image}
                              src={featured.image}
                              alt=""
                              className="h-full w-auto max-w-full object-contain object-left"
                            />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={featured.image}
                            src={featured.image}
                            alt=""
                            className="mb-4 h-24 w-full rounded-lg object-cover object-center ring-1 ring-white/15"
                          />
                        )
                      ) : FeaturedIcon ? (
                        <span className="mb-4 flex h-11 w-11 items-center justify-center text-white">
                          <FeaturedIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                        </span>
                      ) : null}
                      {featured.eyebrow ? (
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
                          {featured.eyebrow}
                        </p>
                      ) : null}
                      <div className="mt-2 h-px w-10 bg-white/70" aria-hidden />
                      <h3 className="mt-3 text-base font-bold leading-snug text-white">
                        {featured.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">
                        {featured.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                      {featured.ctaLabel}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
