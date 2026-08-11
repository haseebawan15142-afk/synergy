"use client";

import { useState } from "react";
import { ThemeManager } from "@/components/admin/modules/ThemeManager";
import { ThemePresetGallery } from "@/components/admin/modules/ThemePresetGallery";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "presets", label: "Event Presets" },
  { id: "custom", label: "Custom Theme" },
] as const;

/** Tabbed theme admin: event gallery + manual ThemeManager. */
export function ThemeAdminPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("presets");
  const [themeKey, setThemeKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === t.id
                ? "bg-synergy text-white shadow-soft"
                : "bg-surface-muted text-ink-body hover:bg-surface-elevated",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "presets" ? (
        <ThemePresetGallery onThemeChanged={() => setThemeKey((k) => k + 1)} />
      ) : (
        <ThemeManager key={themeKey} />
      )}
    </div>
  );
}
