"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  PreviousThemeSnapshot,
  ThemeHeroVideo,
  ThemePreset,
  ThemeTokens,
} from "@/lib/admin/types";
import { DEFAULT_THEME } from "@/lib/admin/types";
import {
  activateDefaultThemePreset,
  activateThemePreset,
  deleteThemePreset,
  duplicateThemePreset,
  fetchActiveThemePreset,
  fetchPreviousThemeSnapshot,
  listThemePresets,
  normalizeHeroVideos,
  originalSynergyTheme,
  revertPreviousTheme,
  saveThemePreset,
} from "@/lib/admin/theme-presets";
import { applyThemeTokensToRoot } from "@/lib/theme/apply-theme";
import { AdminPageSkeleton } from "@/components/admin/AdminSkeleton";
import { HeroVideoSlotsEditor } from "@/components/admin/HeroVideoSlotsEditor";
import {
  AdminPageHeader,
  Card,
  Field,
  PrimaryButton,
  SecondaryButton,
  inputClass,
} from "@/components/admin/ui";
import { cn } from "@/lib/cn";

type Props = { onThemeChanged?: () => void };

type Draft = {
  id?: string;
  name: string;
  eventKey: string;
  emoji: string;
  description: string;
  bannerMessage: string;
  bannerEnabled: boolean;
  startDate: string;
  endDate: string;
  isDefault: boolean;
  category: "national" | "religious" | "seasonal";
  tokens: ThemeTokens;
  heroVideos: ThemeHeroVideo[];
};

function emptyHeroSlots(): ThemeHeroVideo[] {
  return [
    { mp4: "", poster: "", label: "Clip 1" },
    { mp4: "", poster: "", label: "Clip 2" },
    { mp4: "", poster: "", label: "Clip 3" },
  ];
}

function toHeroSlots(videos?: ThemeHeroVideo[]): ThemeHeroVideo[] {
  const normalized = normalizeHeroVideos(videos);
  const slots = emptyHeroSlots();
  for (let i = 0; i < 3; i += 1) {
    if (normalized[i]) slots[i] = { ...slots[i], ...normalized[i] };
  }
  return slots;
}

const CATEGORIES: { id: Draft["category"] | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "national", label: "National" },
  { id: "religious", label: "Religious" },
  { id: "seasonal", label: "Seasonal" },
];

function emptyDraft(): Draft {
  return {
    name: "",
    eventKey: "",
    emoji: "🎨",
    description: "",
    bannerMessage: "",
    bannerEnabled: false,
    startDate: "",
    endDate: "",
    isDefault: false,
    category: "seasonal",
    tokens: { ...DEFAULT_THEME },
    heroVideos: emptyHeroSlots(),
  };
}

function Swatch({ tokens }: { tokens: ThemeTokens }) {
  const colors = [tokens.primary, tokens.secondary, tokens.accent, tokens.background];
  return (
    <div className="flex gap-1.5">
      {colors.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="h-7 w-7 rounded-full border border-border shadow-sm"
          style={{ background: c }}
          title={c}
        />
      ))}
    </div>
  );
}

function isColorKey(key: string) {
  return [
    "primary",
    "secondary",
    "accent",
    "text",
    "textMuted",
    "background",
    "surface",
    "border",
    "buttonBg",
    "buttonText",
  ].includes(key);
}

export function ThemePresetGallery({ onThemeChanged }: Props) {
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState("");
  const [previous, setPrevious] = useState<PreviousThemeSnapshot | null>(null);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewBackup, setPreviewBackup] = useState<ThemeTokens | null>(null);

  const reload = useCallback(async () => {
    const rows = await listThemePresets();
    rows.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.name.localeCompare(b.name);
    });
    setPresets(
      rows.map((p) =>
        p.isDefault || p.id === "default"
          ? { ...p, isDefault: true, tokens: originalSynergyTheme() }
          : p,
      ),
    );
    const [active, prev] = await Promise.all([
      fetchActiveThemePreset().catch(() => null),
      fetchPreviousThemeSnapshot().catch(() => null),
    ]);
    setActiveId(active?.presetId || "");
    setPrevious(prev);
  }, []);

  useEffect(() => {
    reload()
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load presets"))
      .finally(() => setLoading(false));
  }, [reload]);

  const exitPreview = useCallback(() => {
    if (previewBackup) applyThemeTokensToRoot(previewBackup);
    setPreviewBackup(null);
    setPreviewId(null);
  }, [previewBackup]);

  useEffect(() => {
    return () => {
      if (previewBackup) applyThemeTokensToRoot(previewBackup);
    };
  }, [previewBackup]);

  const grouped = useMemo(() => {
    const list =
      filter === "all" ? presets : presets.filter((p) => (p.category || "seasonal") === filter);
    const order: Draft["category"][] = ["national", "religious", "seasonal"];
    return order
      .map((cat) => ({
        cat,
        label: cat[0].toUpperCase() + cat.slice(1),
        items: list.filter((p) => (p.isDefault ? cat === "seasonal" : (p.category || "seasonal") === cat)),
      }))
      .filter((g) => g.items.length > 0);
  }, [presets, filter]);

  if (loading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Event presets"
        description="Activate Pakistani national & cultural themes. Default always restores the original Synergy brand."
        actions={
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              disabled={Boolean(busyId)}
              onClick={async () => {
                setBusyId("default");
                try {
                  exitPreview();
                  await activateDefaultThemePreset();
                  toast.success("Original Synergy theme restored");
                  await reload();
                  onThemeChanged?.();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Restore failed");
                } finally {
                  setBusyId(null);
                }
              }}
            >
              {busyId === "default" ? "Restoring…" : "Restore original Synergy"}
            </SecondaryButton>
            <PrimaryButton disabled={Boolean(draft)} onClick={() => setDraft(emptyDraft())}>
              Create new preset
            </PrimaryButton>
          </div>
        }
      />

      {previous ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-synergy/30 bg-synergy-muted/30">
          <div className="flex items-center gap-3">
            <Swatch tokens={pickSafe(previous)} />
            <div>
              <p className="text-sm font-semibold text-ink">Revert to previous theme</p>
              <p className="text-xs text-ink-muted">
                {previous.previousPresetEmoji || ""}{" "}
                {previous.previousPresetName || "Previous snapshot"} — one step back
              </p>
            </div>
          </div>
          <SecondaryButton
            disabled={Boolean(busyId)}
            onClick={async () => {
              setBusyId("revert");
              try {
                exitPreview();
                const ok = await revertPreviousTheme();
                if (!ok) {
                  toast.error("No previous snapshot");
                  return;
                }
                toast.success("Reverted to previous theme");
                await reload();
                onThemeChanged?.();
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Revert failed");
              } finally {
                setBusyId(null);
              }
            }}
          >
            {busyId === "revert" ? "Reverting…" : "Revert"}
          </SecondaryButton>
        </Card>
      ) : null}

      {previewId ? (
        <div className="sticky top-2 z-40 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm shadow-soft dark:border-amber-800 dark:bg-amber-950">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Preview mode — colors are temporary and not saved.
          </p>
          <PrimaryButton type="button" onClick={exitPreview}>
            Exit preview
          </PrimaryButton>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
              filter === c.id
                ? "bg-synergy text-white"
                : "bg-surface-muted text-ink-body hover:bg-surface-elevated",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            No presets yet. Run <code className="text-ink">npm run cms:seed-theme-presets</code>.
          </p>
        </Card>
      ) : null}

      {grouped.map((group) => (
        <section key={group.cat} className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((preset) => {
              const tokens = preset.tokens || DEFAULT_THEME;
              const active = activeId === preset.id;
              return (
                <Card
                  key={preset.id}
                  className={cn(
                    "flex flex-col transition",
                    active && "ring-2 ring-synergy/50",
                    previewId === preset.id && "ring-2 ring-amber-400",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-ink">
                        <span className="mr-1.5" aria-hidden>
                          {preset.emoji || "🎨"}
                        </span>
                        {preset.name}
                      </h3>
                      <p className="mt-1 text-xs text-ink-muted">
                        {preset.description || preset.eventKey}
                        {preset.startDate && preset.endDate
                          ? ` · ${preset.startDate} → ${preset.endDate}`
                          : ""}
                        {normalizeHeroVideos(preset.heroVideos).length
                          ? ` · ${normalizeHeroVideos(preset.heroVideos).length} hero video(s)`
                          : ""}
                      </p>
                    </div>
                    {active ? (
                      <span className="shrink-0 rounded-full bg-synergy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Active
                      </span>
                    ) : null}
                  </div>
                  <Swatch tokens={tokens} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <SecondaryButton
                      disabled={Boolean(busyId)}
                      onClick={() => {
                        if (!previewBackup) {
                          const live =
                            presets.find((p) => p.id === activeId)?.tokens || DEFAULT_THEME;
                          setPreviewBackup(pickSafe(live));
                        }
                        applyThemeTokensToRoot(tokens);
                        setPreviewId(preset.id);
                        toast.message(`Previewing “${preset.name}”`);
                      }}
                    >
                      Preview
                    </SecondaryButton>
                    <PrimaryButton
                      disabled={Boolean(busyId)}
                      onClick={async () => {
                        setBusyId(preset.id);
                        try {
                          exitPreview();
                          if (preset.isDefault) await activateDefaultThemePreset();
                          else await activateThemePreset(preset);
                          toast.success(
                            preset.isDefault
                              ? "Original Synergy theme activated"
                              : `Activated “${preset.name}”`,
                          );
                          await reload();
                          onThemeChanged?.();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Activate failed");
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      {busyId === preset.id ? "…" : active ? "Re-apply" : "Activate"}
                    </PrimaryButton>
                    <SecondaryButton
                      disabled={Boolean(busyId)}
                      onClick={() =>
                        setDraft({
                          id: preset.id,
                          name: preset.name,
                          eventKey: preset.eventKey,
                          emoji: preset.emoji || "",
                          description: preset.description || "",
                          bannerMessage: preset.bannerMessage || "",
                          bannerEnabled: Boolean(preset.bannerEnabled),
                          startDate: preset.startDate || "",
                          endDate: preset.endDate || "",
                          isDefault: Boolean(preset.isDefault),
                          category: preset.category || "seasonal",
                          tokens: { ...DEFAULT_THEME, ...preset.tokens },
                          heroVideos: toHeroSlots(preset.heroVideos),
                        })
                      }
                    >
                      Edit
                    </SecondaryButton>
                    <SecondaryButton
                      disabled={Boolean(busyId) || preset.isDefault}
                      onClick={async () => {
                        setBusyId(`dup-${preset.id}`);
                        try {
                          await duplicateThemePreset(preset);
                          toast.success("Preset duplicated");
                          await reload();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Duplicate failed");
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      Duplicate
                    </SecondaryButton>
                    <SecondaryButton
                      disabled={Boolean(busyId) || preset.isDefault}
                      onClick={async () => {
                        if (!confirm(`Delete “${preset.name}”?`)) return;
                        setBusyId(`del-${preset.id}`);
                        try {
                          await deleteThemePreset(preset.id);
                          toast.success("Deleted");
                          await reload();
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Delete failed");
                        } finally {
                          setBusyId(null);
                        }
                      }}
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {draft ? (
        <Card>
          <h2 className="mb-4 font-semibold text-ink">
            {draft.id ? "Edit preset" : "Create new preset"}
          </h2>
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input
                className={inputClass}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Event key">
              <input
                className={inputClass}
                value={draft.eventKey}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    eventKey: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  })
                }
              />
            </Field>
            <Field label="Emoji">
              <input
                className={inputClass}
                value={draft.emoji}
                onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className={inputClass}
                value={draft.category}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category: e.target.value as Draft["category"],
                  })
                }
              >
                <option value="national">National</option>
                <option value="religious">Religious</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </Field>
            <Field label="Start (MM-DD)" className="md:col-span-1">
              <input
                className={inputClass}
                placeholder="08-14"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
            </Field>
            <Field label="End (MM-DD)">
              <input
                className={inputClass}
                placeholder="08-14"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <input
                className={inputClass}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <Field label="Banner message" className="md:col-span-2">
              <input
                className={inputClass}
                value={draft.bannerMessage}
                onChange={(e) => setDraft({ ...draft, bannerMessage: e.target.value })}
              />
            </Field>
            <Field label="Banner enabled">
              <select
                className={inputClass}
                value={draft.bannerEnabled ? "true" : "false"}
                onChange={(e) =>
                  setDraft({ ...draft, bannerEnabled: e.target.value === "true" })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </Field>
            <Field label="Default corporate">
              <select
                className={inputClass}
                value={draft.isDefault ? "true" : "false"}
                onChange={(e) =>
                  setDraft({ ...draft, isDefault: e.target.value === "true" })
                }
              >
                <option value="false">No</option>
                <option value="true">Yes (locked Synergy brand)</option>
              </select>
            </Field>
          </div>

          {!draft.isDefault ? (
            <div className="mb-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-ink">Event hero videos (max 3)</h3>
                <p className="mt-1 text-xs text-ink-muted">
                  When this theme is active, the home hero loops these clips every 3 seconds with a
                  smooth crossfade. Poster image is optional. Leave empty to keep Website Settings
                  landing videos.
                </p>
              </div>
              <HeroVideoSlotsEditor
                videos={draft.heroVideos}
                max={3}
                onChange={(heroVideos) => setDraft({ ...draft, heroVideos })}
              />
            </div>
          ) : null}

          <h3 className="mb-3 text-sm font-semibold">Theme tokens</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(draft.tokens).map(([key, value]) => {
              if (key === "activePresetId") return null;
              return (
                <Field key={key} label={key.replace(/[A-Z]/g, " $&")}>
                  <input
                    type={
                      key.includes("Mode") || key === "animationsEnabled"
                        ? "text"
                        : isColorKey(key)
                          ? "color"
                          : "text"
                    }
                    className={inputClass}
                    value={String(value)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tokens: {
                          ...draft.tokens,
                          [key]:
                            key === "animationsEnabled"
                              ? e.target.value === "true"
                              : e.target.value,
                        } as ThemeTokens,
                      })
                    }
                  />
                </Field>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton
              disabled={saving}
              onClick={async () => {
                if (!draft.name.trim() || !draft.eventKey.trim()) {
                  toast.error("Name and event key required");
                  return;
                }
                setSaving(true);
                try {
                  await saveThemePreset({
                    id: draft.id,
                    name: draft.name,
                    eventKey: draft.eventKey,
                    emoji: draft.emoji,
                    description: draft.description,
                    bannerMessage: draft.bannerMessage,
                    bannerEnabled: draft.bannerEnabled,
                    startDate: draft.startDate,
                    endDate: draft.endDate,
                    isDefault: draft.isDefault,
                    category: draft.category,
                    tokens: draft.tokens,
                    heroVideos: draft.heroVideos,
                  });
                  toast.success(draft.id ? "Preset updated" : "Preset created");
                  setDraft(null);
                  await reload();
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Save failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : "Save preset"}
            </PrimaryButton>
            <SecondaryButton disabled={saving} onClick={() => setDraft(null)}>
              Cancel
            </SecondaryButton>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function pickSafe(t: Partial<ThemeTokens>): ThemeTokens {
  return { ...DEFAULT_THEME, ...t };
}
