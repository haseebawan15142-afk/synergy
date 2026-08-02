"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { NavLinkMotion } from "@/components/motion/NavLinkMotion";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { ThemeSelector } from "@/components/theme/ThemeToggle";
import { siteConfig } from "@/lib/content/site";
import { navMegaMenus } from "@/lib/content/nav-menus";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";
import { fadeUp } from "@/lib/motion/variants";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const headerClass = cn(
    "sticky top-0 z-50 border-b shadow-soft backdrop-blur-md transition-colors duration-300 lg:backdrop-blur-xl",
    scrolled
      ? "border-border/80 bg-surface-elevated/95"
      : "border-border/60 bg-surface-elevated/80",
  );

  return (
    <header className={headerClass}>
      <div className="page-container flex items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
        <motion.div
          initial={reduce ? false : { opacity: 0.92 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: motionEase }}
          className="min-w-0 shrink"
        >
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-xl transition hover:opacity-90">
            <BrandLogo variant="header" />
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {siteConfig.nav.map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const menu = navMegaMenus[item.href];

            if (menu) {
              const align = index === 0 ? "left" : index === siteConfig.nav.length - 1 ? "right" : "center";
              return (
                <MegaMenu
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  menu={menu}
                  active={active}
                  align={align}
                />
              );
            }

            return (
              <NavLinkMotion
                key={item.href}
                href={item.href}
                active={active}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors xl:px-4",
                  active
                    ? "bg-synergy-muted text-synergy-light dark:text-synergy-glow"
                    : "text-ink-body hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item.label}
              </NavLinkMotion>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeSelector />
          <Button href="/contact" size="default">
            Contact us
          </Button>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeSelector className="[&_button]:min-h-10 [&_button]:min-w-10 [&_button]:px-2.5 [&_span.hidden]:hidden" />
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-soft"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="text-xl leading-none text-ink">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[55] bg-ink/40 backdrop-blur-[2px] lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-nav"
              key="mobile-nav"
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: motionDurations.reveal, ease: motionEase }}
              className="fixed inset-x-0 top-[3.25rem] z-[56] max-h-[calc(100dvh-3.25rem)] overflow-y-auto border-t border-border/60 bg-surface-elevated/98 shadow-card backdrop-blur-xl sm:top-[3.5rem] sm:max-h-[calc(100dvh-3.5rem)] lg:hidden"
            >
              <motion.nav
                className="page-container flex flex-col gap-0.5 py-4 pb-8"
                aria-label="Mobile"
                variants={reduce ? undefined : { visible: { transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="visible"
              >
                {siteConfig.nav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const menu = navMegaMenus[item.href];
                  const subOpen = mobileSubOpen === item.href;
                  const flatLinks = menu
                    ? menu.columns
                        .flatMap((c) => c.links)
                        .filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i)
                    : [];

                  return (
                    <motion.div key={item.href} variants={reduce ? undefined : fadeUp}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            "block flex-1 rounded-xl px-3 py-3.5 text-base font-medium transition",
                            active
                              ? "bg-synergy-muted text-synergy-dark dark:text-synergy-glow"
                              : "text-ink-body hover:bg-surface-muted hover:text-ink",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {menu ? (
                          <button
                            type="button"
                            aria-expanded={subOpen}
                            aria-label={`Toggle ${item.label} submenu`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-body hover:bg-surface-muted hover:text-ink"
                            onClick={() => setMobileSubOpen(subOpen ? null : item.href)}
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", subOpen && "rotate-180")}
                              aria-hidden
                            />
                          </button>
                        ) : null}
                      </div>
                      {menu ? (
                        <AnimatePresence initial={false}>
                          {subOpen ? (
                            <motion.div
                              initial={reduce ? false : { height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: motionDurations.reveal, ease: motionEase }}
                              className="overflow-hidden pl-3"
                            >
                              <div className="flex flex-col gap-0.5 border-l border-border/60 pl-3 py-1">
                                <Link
                                  href={menu.featured.href}
                                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-synergy transition hover:bg-surface-muted"
                                  onClick={() => setOpen(false)}
                                >
                                  {menu.featured.title}
                                </Link>
                                {flatLinks.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-body transition hover:bg-surface-muted hover:text-ink"
                                    onClick={() => setOpen(false)}
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      ) : null}
                    </motion.div>
                  );
                })}
                <div className="mt-4 border-t border-border/60 pt-4">
                  <ThemeSelector variant="pills" />
                </div>
                <Button href="/contact" className="mt-4 w-full sm:max-w-xs">
                  Contact us
                </Button>
              </motion.nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
