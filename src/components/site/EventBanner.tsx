"use client";

import { useEffect, useState } from "react";
import { subscribeLiveEventBanner } from "@/lib/cms/live-active-theme";
import {
  bannerTextStyleClassName,
  DEFAULT_BANNER_TEXT_STYLE,
  type BannerTextStyle,
} from "@/lib/content/banner-style";
import { cn } from "@/lib/cn";

const SESSION_KEY = "synergy-event-banner-dismissed";

/**
 * Slim dismissible event greeting. Fail-silent: renders nothing when inactive.
 * Fixed under the navbar so it doesn't shift page layout.
 * Live Firestore sync — theme Activate updates open tabs without reload.
 */
export function EventBanner() {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("");
  const [emojiUrl, setEmojiUrl] = useState("");
  const [presetId, setPresetId] = useState("");
  const [textStyle, setTextStyle] = useState<BannerTextStyle>(DEFAULT_BANNER_TEXT_STYLE);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeLiveEventBanner((banner) => {
      if (!banner?.message) {
        setVisible(false);
        setMessage("");
        setPresetId("");
        return;
      }
      try {
        if (sessionStorage.getItem(`${SESSION_KEY}:${banner.presetId}`) === "1") {
          setVisible(false);
          return;
        }
      } catch {
        /* private mode */
      }
      setMessage(banner.message);
      setEmoji(banner.emoji || "");
      setEmojiUrl(banner.emojiUrl || "");
      setPresetId(banner.presetId);
      setTextStyle({
        fontSize: banner.fontSize || DEFAULT_BANNER_TEXT_STYLE.fontSize,
        fontWeight: banner.fontWeight || DEFAULT_BANNER_TEXT_STYLE.fontWeight,
        fontStyle: banner.fontStyle || DEFAULT_BANNER_TEXT_STYLE.fontStyle,
      });
      setVisible(true);
    });
  }, []);

  if (!visible || !message) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 z-40 flex min-h-10 items-center justify-center gap-2 px-10 py-2",
        "bg-synergy text-center text-on-synergy",
        bannerTextStyleClassName(textStyle),
        "shadow-soft",
      )}
      role="status"
    >
      <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-2 truncate">
        {emojiUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={emojiUrl}
            alt=""
            className="h-5 w-5 shrink-0 object-contain sm:h-6 sm:w-6"
            width={24}
            height={24}
          />
        ) : emoji ? (
          <span className="shrink-0" aria-hidden>
            {emoji}
          </span>
        ) : null}
        <span className="truncate">{message}</span>
      </span>
      <button
        type="button"
        aria-label="Dismiss banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-on-synergy/90 hover:bg-white/10"
        onClick={() => {
          setVisible(false);
          try {
            if (presetId) sessionStorage.setItem(`${SESSION_KEY}:${presetId}`, "1");
          } catch {
            /* ignore */
          }
        }}
      >
        ×
      </button>
    </div>
  );
}
