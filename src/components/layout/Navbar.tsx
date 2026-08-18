"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CmsBrandLogo } from "@/components/brand/CmsBrandLogo";
import { NavLinkMotion } from "@/components/motion/NavLinkMotion";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { NavLinkIcon } from "@/components/layout/NavLinkIcon";
import { ResilientImg } from "@/components/media/ResilientImage";
import { ThemeSelector } from "@/components/theme/ThemeToggle";
import {
  MEGA_MENU_ICON_KEYS,
  navMegaMenus,
  partnerFeaturedPreview,
  partnerNavLink,
  type MegaMenuConfig,
} from "@/lib/content/nav-menus";
import { resolveCmsNavIcon, withNavIcons } from "@/lib/content/nav-icons";
import { partners as localPartners } from "@/lib/content/partners";
import { services as localServices } from "@/lib/content/services";
import {
  defaultHeaderNav,
  fetchHeaderNav,
  fetchMegaMenuIcons,
  fetchPartners,
  fetchServices,
  type MegaMenuIconMap,
} from "@/lib/cms/public";
import { useCmsList } from "@/hooks/useCmsList";
import { useOverlayFocus } from "@/hooks/useOverlayFocus";
import type { NavItemDoc } from "@/lib/admin/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { motionDurations, motionEase } from "@/lib/motion/transitions";
import { fadeUp } from "@/lib/motion/variants";

type NavbarProps = {
  /** From server `fetchSiteSettings` — CMS logos only (no public /brand fallback). */
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  companyName?: string | null;
  /**
   * Server-known home route. `usePathname()` is unreliable during SSR in the site
   * layout, which caused a solid white nav (with light link text) over the hero.
   */
  overHero?: boolean;
};

function applyMegaMenuIcons(
  menu: MegaMenuConfig,
  menuKey: string,
  iconMap: MegaMenuIconMap | null,
): MegaMenuConfig {
  const overrides = iconMap?.[menuKey];
  if (!overrides) return menu;
  return {
    ...menu,
    columns: menu.columns.map((column) => ({
      ...column,
      links: withNavIcons(
        column.links.map((link) => {
          const style = overrides[link.href];
          const iconUrl = String(style?.iconUrl || link.logoUrl || "").trim();
          return {
            ...link,
            logoUrl: iconUrl || undefined,
            icon: resolveCmsNavIcon(style?.icon ?? link.icon, link.href, link.label),
          };
        }),
      ),
    })),
  };
}

export function Navbar({
  logoUrl,
  darkLogoUrl,
  footerLogoUrl,
  companyName,
  overHero = false,
}: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [megaIcons, setMegaIcons] = useState<MegaMenuIconMap | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const closeMobileNav = useCallback(() => {
    setOpen(false);
    setMobileSubOpen(null);
  }, []);

  useOverlayFocus({
    open,
    containerRef: mobileNavRef,
    triggerRef: menuButtonRef,
    onEscape: closeMobileNav,
    trapFocus: true,
    initialFocus: true,
  });
  const partnersLoader = useCallback(() => fetchPartners(), []);
  const cmsPartners = useCmsList(localPartners, partnersLoader);
  const servicesLoader = useCallback(() => fetchServices(), []);
  const cmsServices = useCmsList(localServices, servicesLoader);
  const headerLoader = useCallback(() => fetchHeaderNav(), []);
  const localHeader = useMemo(() => defaultHeaderNav(), []);
  const headerNav = useCmsList<NavItemDoc>(localHeader, headerLoader);

  useEffect(() => {
    let cancelled = false;
    fetchMegaMenuIcons()
      .then((map) => {
        if (!cancelled) setMegaIcons(map);
      })
      .catch(() => {
        /* keep local mega defaults from navMegaMenus */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const menus = useMemo((): Record<string, MegaMenuConfig> => {
    const serviceMid = Math.ceil(cmsServices.length / 2);
    const serviceLeft = cmsServices.slice(0, serviceMid);
    const serviceRight = cmsServices.slice(serviceMid);
    const featuredService = cmsServices[0];
    const serviceLink = (s: (typeof cmsServices)[number]) => {
      const iconUrl = String(s.iconUrl || "").trim();
      return {
        label: s.title,
        href: `/services/${s.slug}`,
        logoUrl: iconUrl || undefined,
        icon: resolveCmsNavIcon(s.icon, `/services/${s.slug}`, s.title),
      };
    };

    const next: Record<string, MegaMenuConfig> = {
      ...navMegaMenus,
      "/services": {
        ...navMegaMenus["/services"],
        featured: featuredService
          ? {
              ...navMegaMenus["/services"].featured,
              title: featuredService.title,
              description: featuredService.summary,
              href: `/services/${featuredService.slug}`,
              image: featuredService.image || navMegaMenus["/services"].featured.image,
            }
          : navMegaMenus["/services"].featured,
        columns: [
          {
            heading: "Infrastructure & Support",
            links: withNavIcons(serviceLeft.map(serviceLink)),
          },
          {
            heading: "Cloud & Data",
            links: withNavIcons(serviceRight.map(serviceLink)),
          },
        ],
      },
      "/partners": (() => {
        const topPartners = cmsPartners.slice(0, 5);
        const defaultPartner =
          topPartners.find((p) => p.slug === "dynatrace") ?? topPartners[0];
        return {
          ...navMegaMenus["/partners"],
          featured: defaultPartner
            ? partnerFeaturedPreview(defaultPartner)
            : navMegaMenus["/partners"].featured,
          columns: [
            {
              heading: "Technology principals",
              links: topPartners.map((p) => partnerNavLink(p)),
            },
          ],
          seeAll: { label: "See all partners", href: "/partners" },
        };
      })(),
    };

    for (const key of MEGA_MENU_ICON_KEYS) {
      if (next[key]) {
        next[key] = applyMegaMenuIcons(next[key], key, megaIcons);
      }
    }

    return next;
  }, [cmsPartners, cmsServices, megaIcons]);

  useEffect(() => {
    // Keep home hero nav transparent until the user actually scrolls;
    // a tiny threshold (e.g. 6px) flips to solid too early on some browsers.
    const onScroll = () => setScrolled(window.scrollY > 40);
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
    setMobileSubOpen(null);
  }, [pathname]);

  // SSR: trust server `overHero` (usePathname is wrong in this layout on Vercel).
  // After hydration: trust client pathname so in-app navigations stay correct.
  const isHome = hydrated ? pathname === "/" : overHero || pathname === "/";
  // Transparent sticky bar over hero video so media can fill the viewport
  const overMedia = isHome && !scrolled && !open;

  const headerClass = cn(
    "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
    overMedia
      ? "border-transparent bg-transparent shadow-none"
      : // Explicit white solid bar after scroll (readable dark links below).
        // Avoid relying on CMS ink tokens that can leave light text on white.
        "border-slate-200/80 bg-white/95 shadow-soft backdrop-blur-md dark:border-border dark:bg-surface-elevated/95",
  );

  return (
    <>
    <header className={headerClass}>
      <div className="page-container relative flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3 lg:gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0.92 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: motionEase }}
          className="min-w-0 shrink"
        >
          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-xl transition hover:opacity-90">
            <CmsBrandLogo
              variant="header"
              theme={overMedia ? "dark" : "light"}
              logoUrl={logoUrl}
              darkLogoUrl={darkLogoUrl}
              footerLogoUrl={footerLogoUrl}
              companyName={companyName}
            />
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-1.5 lg:flex xl:gap-2" aria-label="Primary">
          {headerNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const menu = menus[item.href];

            if (menu) {
              return (
                <MegaMenu
                  key={item.id || item.href}
                  label={item.label}
                  href={item.href}
                  menu={menu}
                  active={active}
                  onMedia={overMedia}
                />
              );
            }

            return (
              <NavLinkMotion
                key={item.id || item.href}
                href={item.href}
                active={active}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors xl:px-5",
                  overMedia
                    ? active
                      ? "bg-white/15 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                    : active
                      ? "bg-synergy-muted text-synergy-dark dark:text-synergy-glow"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-ink-body dark:hover:bg-surface-muted dark:hover:text-ink",
                )}
              >
                {item.label}
              </NavLinkMotion>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeSelector
            className={
              overMedia
                ? "[&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white [&_button]:hover:bg-white/15"
                : undefined
            }
          />
          <Button
            href="/contact"
            size="default"
            className={cn(
              "whitespace-nowrap rounded-lg px-5 font-semibold tracking-wide shadow-card xl:px-7",
              overMedia && "ring-1 ring-white/20",
            )}
          >
            Contact Us
          </Button>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeSelector
            className={cn(
              "[&_button]:min-h-10 [&_button]:min-w-10 [&_button]:px-2.5 [&_span.hidden]:hidden",
              overMedia &&
                "[&_button]:border-white/25 [&_button]:bg-white/10 [&_button]:text-white [&_button]:hover:bg-white/15",
            )}
          />
          <button
            ref={menuButtonRef}
            type="button"
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border shadow-soft",
              overMedia
                ? "border-white/25 bg-white/10 text-white"
                : "border-slate-200 bg-white text-slate-800 shadow-soft dark:border-border dark:bg-surface-elevated dark:text-ink",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-haspopup="dialog"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="text-xl leading-none" aria-hidden>
              {open ? "×" : "☰"}
            </span>
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
              onClick={closeMobileNav}
              tabIndex={-1}
            />
            <motion.div
              ref={mobileNavRef}
              id="mobile-nav"
              key="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              tabIndex={-1}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: motionDurations.reveal, ease: motionEase }}
              className="fixed inset-x-0 top-[3.25rem] z-[56] max-h-[calc(100dvh-3.25rem)] overflow-y-auto border-t border-border bg-surface-elevated shadow-card sm:top-[3.5rem] sm:max-h-[calc(100dvh-3.5rem)] lg:hidden"
            >
              <motion.nav
                className="page-container flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border py-0 pb-0 mt-3 mb-4"
                aria-label="Mobile"
                variants={reduce ? undefined : { visible: { transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="visible"
              >
                {headerNav.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const menu = menus[item.href];
                  const subOpen = mobileSubOpen === item.href;
                  const flatLinks = menu
                    ? menu.columns
                        .flatMap((c) => c.links)
                        .filter((l, i, arr) => arr.findIndex((x) => x.href === l.href) === i)
                    : [];

                  return (
                    <motion.div
                      key={item.id || item.href}
                      variants={reduce ? undefined : fadeUp}
                      className="bg-surface-elevated"
                    >
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            "block flex-1 px-4 py-4 text-base font-semibold transition",
                            active
                              ? "bg-synergy-muted text-synergy-dark dark:text-synergy-glow"
                              : "text-ink hover:bg-surface-muted",
                          )}
                          onClick={closeMobileNav}
                        >
                          {item.label}
                        </Link>
                        {menu ? (
                          <button
                            type="button"
                            aria-expanded={subOpen}
                            aria-label={`Toggle ${item.label} submenu`}
                            className={cn(
                              "flex h-full min-h-[3.25rem] w-14 shrink-0 items-center justify-center border-l border-border text-ink-body transition hover:bg-surface-muted hover:text-ink",
                              subOpen && "bg-surface-muted text-ink",
                            )}
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
                              className="overflow-hidden border-t border-white/15"
                              style={{
                                background:
                                  "linear-gradient(145deg, #0d2818 0%, #1a4d2a 45%, #357c3c 100%)",
                              }}
                            >
                              <div className="divide-y divide-white/10">
                                <Link
                                  href={menu.featured.href}
                                  className="block px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                                  onClick={closeMobileNav}
                                >
                                  {menu.featured.title}
                                </Link>
                                {flatLinks.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                                    onClick={closeMobileNav}
                                  >
                                    <span
                                      className={cn(
                                        "flex h-8 w-8 items-center justify-center overflow-hidden text-white",
                                        link.logoUrl && "rounded-md bg-white/95 p-0.5",
                                      )}
                                    >
                                      {link.logoUrl ? (
                                        <ResilientImg
                                          src={link.logoUrl}
                                          alt=""
                                          className="block h-full max-h-5 w-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <NavLinkIcon
                                          href={link.href}
                                          label={link.label}
                                          icon={link.icon}
                                          size={16}
                                        />
                                      )}
                                    </span>
                                    <span className="flex-1">{link.label}</span>
                                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-white/45" aria-hidden />
                                  </Link>
                                ))}
                                {menu.seeAll ? (
                                  <Link
                                    href={menu.seeAll.href}
                                    className="block px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                    onClick={closeMobileNav}
                                  >
                                    {menu.seeAll.label} →
                                  </Link>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      ) : null}
                    </motion.div>
                  );
                })}
              </motion.nav>
              <div className="page-container pb-8">
                <div className="border-t border-border pt-4">
                  <ThemeSelector variant="pills" />
                </div>
                <Button href="/contact" className="mt-4 w-full rounded-lg sm:max-w-xs">
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
    {/* Reserve space under fixed nav on non-home pages; home hero goes full-bleed under transparent bar */}
    <div
      className={cn("shrink-0", isHome ? "h-0" : "h-[3.75rem] sm:h-16")}
      aria-hidden
    />
    </>
  );
}
