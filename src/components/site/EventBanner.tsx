"use client";

import { useEffect, useState } from "react";
import { fetchActiveEventBanner } from "@/lib/cms/public";
import { cn } from "@/lib/cn";

const SESSION_KEY = "synergy-event-banner-dismissed";

/**
 * Slim dismissible event greeting. Fail-silent: renders nothing when inactive.
 * Fixed under the navbar so it doesn't shift page layout.
 */
export function EventBanner() {
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("");
  const [presetId, setPresetId] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActiveEventBanner()
      .then((banner) => {
        if (cancelled || !banner?.message) return;
        try {
          if (sessionStorage.getItem(`${SESSION_KEY}:${banner.presetId}`) === "1") return;
        } catch {
          /* private mode */
        }
        setMessage(banner.message);
        setEmoji(banner.emoji || "");
        setPresetId(banner.presetId);
        setVisible(true);
      })
      .catch(() => {
        /* fail silent */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible || !message) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 z-40 flex h-10 items-center justify-center gap-2 px-10",
        "bg-synergy text-center text-xs font-semibold text-on-synergy sm:text-sm",
        "shadow-soft",
      )}
      role="status"
    >
      <span className="truncate">
        {emoji ? `${emoji} ` : ""}
        {message}
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
