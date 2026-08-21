import type {
  ActiveThemePreset,
  PreviousThemeSnapshot,
  ThemeHeroVideo,
  ThemePreset,
  ThemeTokens,
} from "@/lib/admin/types";
import { DEFAULT_THEME } from "@/lib/admin/types";
import {
  createDoc,
  deleteDocById,
  getById,
  listCollection,
  updateDocById,
  upsertSingleton,
} from "@/lib/admin/crud";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { invalidateCmsCache } from "@/lib/cms/cache";
import { requestPublicCmsRevalidate } from "@/lib/cms/revalidate-client";
import { normalizeBannerTextStyle } from "@/lib/content/banner-style";
import { normalizeClipDurationSec, isPlayableCmsHeroUrl, isLegacyBundledHeroUrl } from "@/lib/content/hero-videos";

export const THEME_PRESET_PREFIX = "preset_";

const RESERVED_THEME_DOCS = new Set<string>([
  DOCS.themeTokens,
  DOCS.previousThemeTokens,
  DOCS.activeThemePreset,
  DOCS.originalThemeBaseline,
]);

export function themePresetDocId(eventKey: string) {
  return eventKey
    .trim()
    .toLowerCase()
    .replace(/^preset_/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pickThemeTokens(value: Partial<ThemeTokens> | null | undefined): ThemeTokens {
  const src = value || {};
  return {
    primary: String(src.primary ?? DEFAULT_THEME.primary),
    secondary: String(src.secondary ?? DEFAULT_THEME.secondary),
    accent: String(src.accent ?? DEFAULT_THEME.accent),
    text: String(src.text ?? DEFAULT_THEME.text),
    textMuted: String(src.textMuted ?? DEFAULT_THEME.textMuted),
    buttonBg: String(src.buttonBg ?? DEFAULT_THEME.buttonBg),
    buttonText: String(src.buttonText ?? DEFAULT_THEME.buttonText),
    background: String(src.background ?? DEFAULT_THEME.background),
    surface: String(src.surface ?? DEFAULT_THEME.surface),
    border: String(src.border ?? DEFAULT_THEME.border),
    borderRadius: String(src.borderRadius ?? DEFAULT_THEME.borderRadius),
    shadow: String(src.shadow ?? DEFAULT_THEME.shadow),
    fontFamily: String(src.fontFamily ?? DEFAULT_THEME.fontFamily),
    fontSizeBase: String(src.fontSizeBase ?? DEFAULT_THEME.fontSizeBase),
    containerWidth: String(src.containerWidth ?? DEFAULT_THEME.containerWidth),
    spacing: String(src.spacing ?? DEFAULT_THEME.spacing),
    animationsEnabled:
      typeof src.animationsEnabled === "boolean"
        ? src.animationsEnabled
        : DEFAULT_THEME.animationsEnabled,
    darkModeDefault:
      src.darkModeDefault === "light" ||
      src.darkModeDefault === "dark" ||
      src.darkModeDefault === "system"
        ? src.darkModeDefault
        : DEFAULT_THEME.darkModeDefault,
  };
}

export function originalSynergyTheme(): ThemeTokens {
  return { ...DEFAULT_THEME };
}

/** Keep at most 3 clips with a usable mp4 URL (no undefined fields — Firestore-safe). */
export function normalizeHeroVideos(
  videos: ThemeHeroVideo[] | null | undefined,
): ThemeHeroVideo[] {
  if (!Array.isArray(videos)) return [];
  return videos
    .map((v, i) => {
      const mp4 = String(v?.mp4 || "").trim();
      const poster = String(v?.poster || "").trim();
      const webm = String(v?.webm || "").trim();
      const label = String(v?.label || `Event clip ${i + 1}`).trim();
      const durationSec = normalizeClipDurationSec(v?.durationSec, 3);
      const row: ThemeHeroVideo = { mp4, label, durationSec };
      if (poster && !isLegacyBundledHeroUrl(poster)) row.poster = poster;
      if (webm && isPlayableCmsHeroUrl(webm)) row.webm = webm;
      return row;
    })
    .filter((v) => isPlayableCmsHeroUrl(v.mp4))
    .slice(0, 3);
}

function isDefaultPreset(preset: Pick<ThemePreset, "id" | "eventKey" | "isDefault">) {
  const key = themePresetDocId(preset.eventKey || preset.id || "");
  return Boolean(preset.isDefault) || key === "default";
}

async function ensureOriginalBaseline() {
  const brand = originalSynergyTheme();
  await upsertSingleton(COLLECTIONS.theme, DOCS.originalThemeBaseline, {
    ...brand,
    kind: "baseline",
    label: "Original Synergy corporate (pre event presets)",
  });
  try {
    await upsertSingleton(COLLECTIONS.themePresets, "default", {
      kind: "preset",
      name: "Default / Corporate",
      eventKey: "default",
      emoji: "🏢",
      description: "Original Synergy Computers brand look.",
      isDefault: true,
      category: "seasonal",
      tokens: brand,
      bannerEnabled: false,
      bannerMessage: "",
      startDate: "",
      endDate: "",
    });
  } catch {
    /* ignore */
  }
  return brand;
}

type PresetRow = ThemePreset & { kind?: string };

function asPreset(row: PresetRow): ThemePreset | null {
  if (!row.id || RESERVED_THEME_DOCS.has(row.id)) return null;
  if (!row.tokens) return null;
  const eventKey =
    row.eventKey ||
    (row.id.startsWith(THEME_PRESET_PREFIX)
      ? row.id.slice(THEME_PRESET_PREFIX.length)
      : row.id);
  const bannerStyle = normalizeBannerTextStyle({
    fontSize: row.bannerFontSize,
    fontWeight: row.bannerFontWeight,
    fontStyle: row.bannerFontStyle,
  });
  return {
    id: row.id.startsWith(THEME_PRESET_PREFIX) ? eventKey : row.id,
    name: row.name || eventKey,
    eventKey,
    emoji: row.emoji || "",
    emojiUrl: String(row.emojiUrl || "").trim(),
    description: row.description || "",
    tokens: pickThemeTokens(row.tokens),
    bannerMessage: row.bannerMessage || "",
    bannerEnabled: Boolean(row.bannerEnabled),
    bannerFontSize: bannerStyle.fontSize,
    bannerFontWeight: bannerStyle.fontWeight,
    bannerFontStyle: bannerStyle.fontStyle,
    heroVideos: normalizeHeroVideos(row.heroVideos),
    startDate: row.startDate || "",
    endDate: row.endDate || "",
    isDefault: Boolean(row.isDefault),
    category: row.category,
    updatedAt: row.updatedAt,
  };
}

export async function listThemePresets(): Promise<ThemePreset[]> {
  try {
    const dedicated = await listCollection<PresetRow>(COLLECTIONS.themePresets);
    const mapped = dedicated
      .map((row) => asPreset({ ...row, kind: "preset" }))
      .filter((p): p is ThemePreset => Boolean(p));
    if (mapped.length > 0) return mapped;
  } catch {
    /* fall through */
  }

  const rows = await listCollection<PresetRow>(COLLECTIONS.theme);
  return rows
    .filter(
      (row) =>
        row.kind === "preset" ||
        (row.id?.startsWith(THEME_PRESET_PREFIX) && Boolean(row.tokens)),
    )
    .map(asPreset)
    .filter((p): p is ThemePreset => Boolean(p));
}

export async function saveThemePreset(
  input: Omit<ThemePreset, "id" | "updatedAt"> & { id?: string },
): Promise<string> {
  const eventKey = themePresetDocId(input.eventKey);
  const id = themePresetDocId(input.id || eventKey);
  const asDefault = Boolean(input.isDefault) || eventKey === "default";
  const bannerStyle = normalizeBannerTextStyle({
    fontSize: input.bannerFontSize,
    fontWeight: input.bannerFontWeight,
    fontStyle: input.bannerFontStyle,
  });
  const payload = {
    kind: "preset" as const,
    name: input.name.trim(),
    eventKey,
    emoji: input.emoji || "",
    emojiUrl: String(input.emojiUrl || "").trim(),
    description: input.description || "",
    tokens: asDefault ? originalSynergyTheme() : pickThemeTokens(input.tokens),
    bannerMessage: input.bannerMessage || "",
    bannerEnabled: Boolean(input.bannerEnabled),
    bannerFontSize: bannerStyle.fontSize,
    bannerFontWeight: bannerStyle.fontWeight,
    bannerFontStyle: bannerStyle.fontStyle,
    heroVideos: asDefault ? [] : normalizeHeroVideos(input.heroVideos),
    startDate: asDefault ? "" : input.startDate || "",
    endDate: asDefault ? "" : input.endDate || "",
    isDefault: asDefault,
    category: input.category || "seasonal",
  };

  const existing = await getById(COLLECTIONS.themePresets, id);
  if (existing) await updateDocById(COLLECTIONS.themePresets, id, payload);
  else await createDoc(COLLECTIONS.themePresets, payload, id);

  // If this preset is currently live, mirror banner + hero videos immediately
  // (site reads theme/activePreset — not the presets collection).
  const active = await fetchActiveThemePreset();
  if (active?.presetId === id || active?.eventKey === eventKey) {
    await upsertSingleton(COLLECTIONS.theme, DOCS.activeThemePreset, {
      ...active,
      name: payload.name,
      emoji: payload.emoji,
      emojiUrl: payload.emojiUrl,
      bannerMessage: payload.bannerMessage,
      bannerEnabled: Boolean(payload.bannerEnabled) && Boolean(payload.bannerMessage?.trim()),
      bannerFontSize: payload.bannerFontSize,
      bannerFontWeight: payload.bannerFontWeight,
      bannerFontStyle: payload.bannerFontStyle,
      heroVideos: payload.heroVideos,
      presetId: id,
      eventKey,
    });
    invalidateCmsCache("theme");
    void requestPublicCmsRevalidate(["cms-theme"]);
  }

  try {
    await deleteDocById(COLLECTIONS.theme, `${THEME_PRESET_PREFIX}${eventKey}`);
  } catch {
    /* ignore */
  }
  return id;
}

export async function deleteThemePreset(id: string): Promise<void> {
  const eventKey = themePresetDocId(id);
  if (RESERVED_THEME_DOCS.has(eventKey) || eventKey === "default") {
    throw new Error("Cannot delete a system theme document");
  }
  await deleteDocById(COLLECTIONS.themePresets, eventKey);
  try {
    await deleteDocById(COLLECTIONS.theme, `${THEME_PRESET_PREFIX}${eventKey}`);
  } catch {
    /* ignore */
  }
}

export async function duplicateThemePreset(preset: ThemePreset): Promise<string> {
  const base = themePresetDocId(preset.eventKey || preset.id);
  const eventKey = `${base}-copy-${Date.now().toString(36).slice(-4)}`;
  return saveThemePreset({
    name: `${preset.name} (copy)`,
    eventKey,
    emoji: preset.emoji,
    emojiUrl: preset.emojiUrl,
    description: preset.description,
    tokens: pickThemeTokens(preset.tokens),
    bannerMessage: preset.bannerMessage,
    bannerEnabled: Boolean(preset.bannerEnabled),
    bannerFontSize: preset.bannerFontSize,
    bannerFontWeight: preset.bannerFontWeight,
    bannerFontStyle: preset.bannerFontStyle,
    heroVideos: normalizeHeroVideos(preset.heroVideos),
    startDate: preset.startDate,
    endDate: preset.endDate,
    isDefault: false,
    category: preset.category || "seasonal",
  });
}

export async function activateThemePreset(preset: ThemePreset): Promise<void> {
  await ensureOriginalBaseline();
  const current = await getById<ThemeTokens & { activePresetId?: string }>(
    COLLECTIONS.theme,
    DOCS.themeTokens,
  );
  const active = await fetchActiveThemePreset();
  const snapshot: PreviousThemeSnapshot = {
    ...pickThemeTokens(current || DEFAULT_THEME),
    previousActivePresetId: active?.presetId || current?.activePresetId || "",
    previousPresetName: active?.name || "",
    previousPresetEmoji: active?.emoji || "",
  };
  await upsertSingleton(COLLECTIONS.theme, DOCS.previousThemeTokens, snapshot);

  const tokens = isDefaultPreset(preset)
    ? originalSynergyTheme()
    : pickThemeTokens(preset.tokens);
  const presetId = themePresetDocId(preset.id || preset.eventKey);

  await upsertSingleton(COLLECTIONS.theme, DOCS.themeTokens, {
    ...tokens,
    activePresetId: presetId,
  });

  const heroVideos = isDefaultPreset(preset)
    ? []
    : normalizeHeroVideos(preset.heroVideos);

  const bannerStyle = normalizeBannerTextStyle({
    fontSize: preset.bannerFontSize,
    fontWeight: preset.bannerFontWeight,
    fontStyle: preset.bannerFontStyle,
  });

  const activePayload: ActiveThemePreset = {
    presetId,
    eventKey: themePresetDocId(preset.eventKey || preset.id),
    name: preset.name,
    emoji: preset.emoji || "",
    emojiUrl: String(preset.emojiUrl || "").trim(),
    bannerMessage: preset.bannerMessage || "",
    bannerEnabled: Boolean(preset.bannerEnabled) && Boolean(preset.bannerMessage?.trim()),
    bannerFontSize: bannerStyle.fontSize,
    bannerFontWeight: bannerStyle.fontWeight,
    bannerFontStyle: bannerStyle.fontStyle,
    heroVideos,
    activatedAt: new Date().toISOString(),
  };
  await upsertSingleton(COLLECTIONS.theme, DOCS.activeThemePreset, activePayload);
  invalidateCmsCache("theme");
  void requestPublicCmsRevalidate(["cms-theme"]);
}

/** One-step revert to the snapshot taken before the last Activate. */
export async function revertPreviousTheme(): Promise<boolean> {
  const previous = await getById<PreviousThemeSnapshot>(
    COLLECTIONS.theme,
    DOCS.previousThemeTokens,
  );
  if (!previous?.primary) return false;

  const tokens = pickThemeTokens(previous);
  const prevId = previous.previousActivePresetId || "";
  await upsertSingleton(COLLECTIONS.theme, DOCS.themeTokens, {
    ...tokens,
    activePresetId: prevId,
  });
  // Re-hydrate hero playlist + banner style from the previous preset doc when possible.
  let heroVideos: ThemeHeroVideo[] = [];
  let bannerStyle = normalizeBannerTextStyle(null);
  let bannerMessage = "";
  let bannerEnabled = false;
  let emoji = previous.previousPresetEmoji || "";
  let emojiUrl = "";
  let name = previous.previousPresetName || "";
  if (prevId && prevId !== "default") {
    try {
      const prevPreset = await getById<ThemePreset>(COLLECTIONS.themePresets, prevId);
      heroVideos = normalizeHeroVideos(prevPreset?.heroVideos);
      bannerStyle = normalizeBannerTextStyle({
        fontSize: prevPreset?.bannerFontSize,
        fontWeight: prevPreset?.bannerFontWeight,
        fontStyle: prevPreset?.bannerFontStyle,
      });
      bannerMessage = prevPreset?.bannerMessage || "";
      bannerEnabled = Boolean(prevPreset?.bannerEnabled) && Boolean(bannerMessage.trim());
      emoji = prevPreset?.emoji || emoji;
      emojiUrl = String(prevPreset?.emojiUrl || "").trim();
      name = prevPreset?.name || name;
    } catch {
      heroVideos = [];
    }
  }

  await upsertSingleton(COLLECTIONS.theme, DOCS.activeThemePreset, {
    presetId: prevId,
    eventKey: prevId,
    name,
    emoji,
    emojiUrl,
    bannerMessage,
    bannerEnabled,
    bannerFontSize: bannerStyle.fontSize,
    bannerFontWeight: bannerStyle.fontWeight,
    bannerFontStyle: bannerStyle.fontStyle,
    heroVideos,
    activatedAt: new Date().toISOString(),
  });
  invalidateCmsCache("theme");
  void requestPublicCmsRevalidate(["cms-theme"]);
  return true;
}

/** Always restore locked Synergy original brand. */
export async function activateDefaultThemePreset(): Promise<ThemePreset | null> {
  const brand = await ensureOriginalBaseline();
  const synthetic: ThemePreset = {
    id: "default",
    name: "Default / Corporate",
    eventKey: "default",
    emoji: "🏢",
    isDefault: true,
    category: "seasonal",
    tokens: brand,
    bannerEnabled: false,
  };
  await activateThemePreset(synthetic);
  return synthetic;
}

export async function fetchActiveThemePreset(): Promise<ActiveThemePreset | null> {
  const row = await getById<ActiveThemePreset>(COLLECTIONS.theme, DOCS.activeThemePreset);
  if (!row?.presetId) return null;
  return { ...row, presetId: themePresetDocId(row.presetId) };
}

export async function fetchPreviousThemeSnapshot(): Promise<PreviousThemeSnapshot | null> {
  const previous = await getById<PreviousThemeSnapshot>(
    COLLECTIONS.theme,
    DOCS.previousThemeTokens,
  );
  if (!previous?.primary) return null;
  return previous;
}

export async function hasPreviousThemeSnapshot(): Promise<boolean> {
  return Boolean(await fetchPreviousThemeSnapshot());
}
