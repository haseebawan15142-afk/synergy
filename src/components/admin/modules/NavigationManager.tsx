"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MegaMenuIconLinkDoc, MegaMenuIconsDoc, NavItemDoc } from "@/lib/admin/types";
import { getById, upsertSingleton } from "@/lib/admin/crud";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import {
  MEGA_MENU_ICON_KEYS,
  MEGA_MENU_ICON_SECTION_LABELS,
  defaultMegaMenuIconLinks,
  type MegaMenuIconKey,
} from "@/lib/content/nav-menus";
import { defaultHeaderNav } from "@/lib/cms/public";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { NavIconField } from "@/components/admin/NavIconField";
import {
  AdminPageHeader,
  Card,
  Field,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "@/components/admin/ui";

type TabId = typeof DOCS.navigationPrimary | typeof DOCS.navigationFooter | "megaMenus";

const TABS: { id: TabId; label: string; hint: string }[] = [
  {
    id: DOCS.navigationPrimary,
    label: "Header",
    hint: "Primary navbar top-level links (label, URL, order). Mega panels still attach by matching href (e.g. /about, /services).",
  },
  {
    id: "megaMenus",
    label: "Mega menus",
    hint: "Upload custom icons (or pick a preset) for About, Industries, and Insights. Services: Admin → Services. Partners use logos.",
  },
  {
    id: DOCS.navigationFooter,
    label: "Footer",
    hint: "Company column links in the site footer.",
  },
];

function seedMegaMenus(): Record<string, { links: MegaMenuIconLinkDoc[] }> {
  const defaults = defaultMegaMenuIconLinks();
  const menus: Record<string, { links: MegaMenuIconLinkDoc[] }> = {};
  for (const key of MEGA_MENU_ICON_KEYS) {
    menus[key] = {
      links: defaults[key].links.map((link) => ({
        href: link.href,
        label: link.label,
        icon: link.icon,
        iconUrl: link.logoUrl,
      })),
    };
  }
  return menus;
}

function mergeMegaMenus(
  stored: MegaMenuIconsDoc["menus"] | undefined,
): Record<string, { links: MegaMenuIconLinkDoc[] }> {
  const seeded = seedMegaMenus();
  if (!stored) return seeded;

  const out: Record<string, { links: MegaMenuIconLinkDoc[] }> = {};
  for (const key of MEGA_MENU_ICON_KEYS) {
    const defaults = seeded[key].links;
    const cmsLinks = stored[key]?.links || [];
    const byHref = new Map(cmsLinks.map((l) => [l.href, l]));
    out[key] = {
      links: defaults.map((def) => {
        const hit = byHref.get(def.href);
        return {
          href: def.href,
          label: hit?.label || def.label,
          icon: hit?.icon !== undefined ? hit.icon : def.icon,
          iconUrl: hit?.iconUrl !== undefined ? hit.iconUrl : def.iconUrl,
        };
      }),
    };
  }
  return out;
}

export function NavigationManager() {
  const [tab, setTab] = useState<TabId>(DOCS.navigationPrimary);
  const [items, setItems] = useState<NavItemDoc[]>([]);
  const [megaMenus, setMegaMenus] = useState<Record<string, { links: MegaMenuIconLinkDoc[] }>>(
    () => seedMegaMenus(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "megaMenus") {
      getById<MegaMenuIconsDoc>(COLLECTIONS.navigation, DOCS.navigationMegaMenus)
        .then((doc) => setMegaMenus(mergeMegaMenus(doc?.menus)))
        .catch(() => {
          setMegaMenus(seedMegaMenus());
          toast.error("Failed to load mega menu icons — showing defaults");
        })
        .finally(() => setLoading(false));
      return;
    }

    getById<{ items?: NavItemDoc[] }>(COLLECTIONS.navigation, tab)
      .then((x) => {
        const loaded = x?.items || [];
        if (tab === DOCS.navigationPrimary && loaded.length === 0) {
          setItems(defaultHeaderNav());
        } else {
          setItems(loaded);
        }
      })
      .catch(() => toast.error("Failed to load navigation"))
      .finally(() => setLoading(false));
  }, [tab]);

  const update = (i: number, key: keyof NavItemDoc, value: string | boolean) =>
    setItems(items.map((x, n) => (n === i ? { ...x, [key]: value } : x)));

  const move = (i: number, d: number) => {
    const n = i + d;
    if (n < 0 || n >= items.length) return;
    const next = [...items];
    [next[i], next[n]] = [next[n], next[i]];
    setItems(next);
  };

  const updateMegaLink = (
    menuKey: MegaMenuIconKey,
    linkIndex: number,
    patch: Partial<Pick<MegaMenuIconLinkDoc, "icon" | "iconUrl">>,
  ) => {
    setMegaMenus((prev) => {
      const section = prev[menuKey];
      if (!section) return prev;
      const links = section.links.map((link, i) => {
        if (i !== linkIndex) return link;
        return {
          ...link,
          ...patch,
          icon: patch.icon !== undefined ? patch.icon || undefined : link.icon,
          iconUrl: patch.iconUrl !== undefined ? patch.iconUrl || undefined : link.iconUrl,
        };
      });
      return { ...prev, [menuKey]: { links } };
    });
  };

  async function save() {
    setSaving(true);
    try {
      if (tab === "megaMenus") {
        await upsertSingleton(COLLECTIONS.navigation, DOCS.navigationMegaMenus, {
          menus: megaMenus,
        });
        toast.success("Mega menu icons saved");
      } else {
        await upsertSingleton(COLLECTIONS.navigation, tab, { items });
        toast.success(
          tab === DOCS.navigationFooter ? "Footer navigation saved" : "Header navigation saved",
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminPageSkeleton />;

  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Navigation"
        description={active.hint}
        actions={
          <PrimaryButton onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : tab === "megaMenus" ? "Save mega menu icons" : "Save navigation"}
          </PrimaryButton>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === t.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "megaMenus" ? (
        <div className="space-y-6">
          {MEGA_MENU_ICON_KEYS.map((menuKey) => (
            <Card key={menuKey} className="space-y-4">
              <div>
                <h2 className="font-semibold">{MEGA_MENU_ICON_SECTION_LABELS[menuKey]}</h2>
                <p className="mt-1 text-xs text-zinc-500">Menu key: {menuKey}</p>
              </div>
              {(megaMenus[menuKey]?.links || []).map((link, i) => (
                <div
                  key={`${link.href}-${i}`}
                  className="grid gap-4 border-b border-zinc-100 pb-5 last:border-0 dark:border-zinc-800 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]"
                >
                  <div>
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{link.href}</p>
                  </div>
                  <NavIconField
                    compact
                    iconUrl={link.iconUrl}
                    icon={link.icon}
                    folder="icons"
                    onIconUrlChange={(url) => updateMegaLink(menuKey, i, { iconUrl: url })}
                    onIconChange={(key) => updateMegaLink(menuKey, i, { icon: key })}
                  />
                </div>
              ))}
            </Card>
          ))}
          <SecondaryButton type="button" onClick={() => setMegaMenus(seedMegaMenus())}>
            Reset icons to site defaults
          </SecondaryButton>
        </div>
      ) : (
        <Card className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id} className="grid gap-3 border-b pb-4 md:grid-cols-5">
              <Field label="Label">
                <input
                  className={inputClass}
                  value={item.label}
                  onChange={(e) => update(i, "label", e.target.value)}
                />
              </Field>
              <Field label="URL">
                <input
                  className={inputClass}
                  value={item.href}
                  onChange={(e) => update(i, "href", e.target.value)}
                />
              </Field>
              <Field label="External">
                <input
                  type="checkbox"
                  checked={Boolean(item.external)}
                  onChange={(e) => update(i, "external", e.target.checked)}
                />
              </Field>
              <div className="flex items-end gap-2">
                <SecondaryButton onClick={() => move(i, -1)}>Up</SecondaryButton>
                <SecondaryButton onClick={() => move(i, 1)}>Down</SecondaryButton>
                <SecondaryButton onClick={() => setItems(items.filter((_, n) => n !== i))}>
                  Remove
                </SecondaryButton>
              </div>
              <p className="self-end text-xs text-zinc-500">
                {item.children?.length || 0} nested children retained
              </p>
            </div>
          ))}
          <SecondaryButton
            onClick={() =>
              setItems([...items, { id: crypto.randomUUID(), label: "New link", href: "/" }])
            }
          >
            Add link
          </SecondaryButton>
        </Card>
      )}
    </div>
  );
}
