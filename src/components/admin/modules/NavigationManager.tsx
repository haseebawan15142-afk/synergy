"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { NavItemDoc } from "@/lib/admin/types";
import { getById, upsertSingleton } from "@/lib/admin/crud";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import {
  AdminPageHeader,
  Card,
  Field,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "@/components/admin/ui";

type NavDocKey = typeof DOCS.navigationPrimary | typeof DOCS.navigationFooter;

const TABS: { id: NavDocKey; label: string; hint: string }[] = [
  {
    id: DOCS.navigationPrimary,
    label: "Header",
    hint: "Primary navbar links (advanced mega-menus may still use local defaults until fully migrated).",
  },
  {
    id: DOCS.navigationFooter,
    label: "Footer",
    hint: "Company column links in the site footer.",
  },
];

export function NavigationManager() {
  const [tab, setTab] = useState<NavDocKey>(DOCS.navigationPrimary);
  const [items, setItems] = useState<NavItemDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getById<{ items?: NavItemDoc[] }>(COLLECTIONS.navigation, tab)
      .then((x) => setItems(x?.items || []))
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

  async function save() {
    setSaving(true);
    try {
      await upsertSingleton(COLLECTIONS.navigation, tab, { items });
      toast.success(tab === DOCS.navigationFooter ? "Footer navigation saved" : "Header navigation saved");
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
            {saving ? "Saving…" : "Save navigation"}
          </PrimaryButton>
        }
      />

      <div className="flex gap-2">
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
    </div>
  );
}
