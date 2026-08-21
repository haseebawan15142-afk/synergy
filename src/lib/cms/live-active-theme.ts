"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS, DOCS } from "@/lib/firebase/collections";
import { DEFAULT_THEME, type ThemeTokens } from "@/lib/admin/types";
import {
  normalizeBannerTextStyle,
  type BannerFontSize,
  type BannerFontStyle,
  type BannerFontWeight,
} from "@/lib/content/banner-style";
import {
  normalizeClipDurationSec,
  resolveLandingHeroVideos,
  isPlayableCmsHeroUrl,
  isLegacyBundledHeroUrl,
  type HeroVideo,
} from "@/lib/content/hero-videos";
import { invalidateCmsCache } from "@/lib/cms/cache";
import type { ActiveEventBanner, ActiveEventHeroVideos } from "@/lib/cms/public";

type ActivePresetDoc = {
  presetId?: string;
  eventKey?: string;
  name?: string;
  emoji?: string;
  emojiUrl?: string;
  bannerMessage?: string;
  bannerEnabled?: boolean;
  bannerFontSize?: string;
  bannerFontWeight?: string;
  bannerFontStyle?: string;
  heroVideos?: {
    mp4?: string;
    poster?: string;
    webm?: string;
    label?: string;
    durationSec?: number;
  }[];
};

function parseHeroVideos(data: ActivePresetDoc | null): ActiveEventHeroVideos | null {
  if (!data) return null;
  const presetId = String(data.presetId || "");
  const eventKey = String(data.eventKey || presetId);
  if (!presetId || presetId === "default" || eventKey === "default") return null;

  const videos = (Array.isArray(data.heroVideos) ? data.heroVideos : [])
    .map((v, i) => {
      const mp4 = String(v?.mp4 || "").trim();
      const poster = String(v?.poster || "").trim();
      const webm = String(v?.webm || "").trim();
      const label = String(v?.label || `Event clip ${i + 1}`).trim();
      const durationSec = normalizeClipDurationSec(v?.durationSec, 3);
      if (!isPlayableCmsHeroUrl(mp4)) return null;
      const row: HeroVideo = { mp4, label, durationSec };
      if (webm && isPlayableCmsHeroUrl(webm)) row.webm = webm;
      if (poster && !isLegacyBundledHeroUrl(poster)) row.poster = poster;
      return row;
    })
    .filter((v): v is HeroVideo => Boolean(v))
    .slice(0, 3);

  if (!videos.length) return null;
  return { presetId, eventKey, videos };
}

function parseBanner(data: ActivePresetDoc | null): ActiveEventBanner | null {
  if (!data?.bannerEnabled || !data.bannerMessage?.trim() || !data.presetId) return null;
  const style = normalizeBannerTextStyle({
    fontSize: data.bannerFontSize as BannerFontSize | undefined,
    fontWeight: data.bannerFontWeight as BannerFontWeight | undefined,
    fontStyle: data.bannerFontStyle as BannerFontStyle | undefined,
  });
  return {
    presetId: data.presetId,
    message: data.bannerMessage.trim(),
    emoji: data.emoji || "",
    emojiUrl: String(data.emojiUrl || "").trim(),
    name: data.name || "",
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
  };
}

export type LiveHeroPlaylist = {
  isEvent: boolean;
  presetId: string;
  videos: HeroVideo[];
};

/**
 * Realtime hero playlist:
 * - Event theme clips when an active non-default theme has videos
 * - Otherwise Website Settings landing clips (live on settings/site)
 */
export function subscribeLiveHeroPlaylist(
  onChange: (playlist: LiveHeroPlaylist) => void,
  getLandingFallback?: () => Promise<HeroVideo[]>,
): () => void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return () => {};
  }

  let cancelled = false;
  let eventPlaylist: ActiveEventHeroVideos | null = null;
  let landingVideos: HeroVideo[] | null = null;
  let landingReady = false;

  const themeRef = doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.activeThemePreset);
  const settingsRef = doc(getFirebaseDb(), COLLECTIONS.settings, DOCS.settingsSite);

  function emit() {
    if (cancelled) return;
    if (eventPlaylist?.videos.length) {
      onChange({
        isEvent: true,
        presetId: eventPlaylist.presetId,
        videos: eventPlaylist.videos,
      });
      return;
    }
    // Wait for settings snapshot so we don't flash bundled local clips over SSR/CMS.
    if (!landingReady) return;
    onChange({
      isEvent: false,
      presetId: "default",
      videos: landingVideos?.length ? landingVideos : resolveLandingHeroVideos(null),
    });
  }

  async function loadLandingFallback() {
    try {
      invalidateCmsCache("settings");
      const landing = getLandingFallback
        ? await getLandingFallback()
        : resolveLandingHeroVideos(null);
      if (cancelled) return;
      landingVideos = resolveLandingHeroVideos(landing);
    } catch {
      if (cancelled) return;
      landingVideos = resolveLandingHeroVideos(null);
    }
    landingReady = true;
    emit();
  }

  const unsubTheme = onSnapshot(
    themeRef,
    (snap) => {
      if (cancelled) return;
      invalidateCmsCache("theme");
      const data = (snap.exists() ? snap.data() : null) as ActivePresetDoc | null;
      eventPlaylist = parseHeroVideos(data);
      emit();
    },
    () => {
      /* keep SSR seed on permission / network errors */
    },
  );

  const unsubSettings = onSnapshot(
    settingsRef,
    (snap) => {
      if (cancelled) return;
      invalidateCmsCache("settings");
      const data = snap.exists() ? snap.data() : null;
      const raw = data && typeof data === "object" ? (data as { heroVideos?: HeroVideo[] }).heroVideos : null;
      landingVideos = resolveLandingHeroVideos(raw);
      landingReady = true;
      emit();
    },
    () => {
      void loadLandingFallback();
    },
  );

  return () => {
    cancelled = true;
    unsubTheme();
    unsubSettings();
  };
}

export function subscribeLiveThemeTokens(
  onChange: (tokens: ThemeTokens) => void,
): () => void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return () => {};
  }

  const ref = doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.themeTokens);
  return onSnapshot(
    ref,
    (snap) => {
      invalidateCmsCache("theme");
      const data = snap.exists() ? (snap.data() as Partial<ThemeTokens>) : null;
      onChange({ ...DEFAULT_THEME, ...(data || {}) });
    },
    () => {
      /* ignore */
    },
  );
}

export function subscribeLiveEventBanner(
  onChange: (banner: ActiveEventBanner | null) => void,
): () => void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return () => {};
  }

  const ref = doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.activeThemePreset);
  return onSnapshot(
    ref,
    (snap) => {
      invalidateCmsCache("theme");
      const data = (snap.exists() ? snap.data() : null) as ActivePresetDoc | null;
      onChange(parseBanner(data));
    },
    () => {
      /* ignore */
    },
  );
}
