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
      if (!mp4) return null;
      const row: HeroVideo = { mp4, label, durationSec };
      if (webm) row.webm = webm;
      if (poster) row.poster = poster;
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
 * Realtime active theme playlist. Event clips when configured; otherwise landing CMS clips.
 */
export function subscribeLiveHeroPlaylist(
  onChange: (playlist: LiveHeroPlaylist) => void,
  getLandingFallback?: () => Promise<HeroVideo[]>,
): () => void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return () => {};
  }

  let cancelled = false;
  const ref = doc(getFirebaseDb(), COLLECTIONS.theme, DOCS.activeThemePreset);

  const unsub = onSnapshot(
    ref,
    async (snap) => {
      if (cancelled) return;
      invalidateCmsCache("theme");
      const data = (snap.exists() ? snap.data() : null) as ActivePresetDoc | null;
      const event = parseHeroVideos(data);
      if (event?.videos.length) {
        onChange({ isEvent: true, presetId: event.presetId, videos: event.videos });
        return;
      }
      try {
        const landing = getLandingFallback
          ? await getLandingFallback()
          : resolveLandingHeroVideos(null);
        if (cancelled) return;
        onChange({
          isEvent: false,
          presetId: "default",
          videos: resolveLandingHeroVideos(landing),
        });
      } catch {
        if (cancelled) return;
        onChange({
          isEvent: false,
          presetId: "default",
          videos: resolveLandingHeroVideos(null),
        });
      }
    },
    () => {
      /* keep SSR seed on permission / network errors */
    },
  );

  return () => {
    cancelled = true;
    unsub();
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
