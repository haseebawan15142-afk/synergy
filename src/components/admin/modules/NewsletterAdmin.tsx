"use client";

import { useState } from "react";
import { NewsletterIssuesManager } from "./NewsletterIssuesManager";
import { NewsletterManager } from "./NewsletterManager";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "editions", label: "Editions" },
  { id: "subscribers", label: "Subscribers" },
] as const;

export function NewsletterAdmin() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("editions");

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
      {tab === "editions" ? <NewsletterIssuesManager /> : <NewsletterManager />}
    </div>
  );
}
