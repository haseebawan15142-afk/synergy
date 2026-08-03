"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ThemeOption = "system" | "light" | "dark";

const options: { value: ThemeOption; label: string; description: string }[] = [
  { value: "system", label: "System", description: "Match device setting" },
  { value: "light", label: "Light", description: "Bright interface" },
  { value: "dark", label: "Dark", description: "Low-light interface" },
];

type ThemeSelectorProps = {
  className?: string;
  /** Inline row of pills (e.g. mobile menu) */
  variant?: "dropdown" | "pills";
};

function ThemeIcon({ mode }: { mode: "light" | "dark" | "system" }) {
  if (mode === "light") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (mode === "dark") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeSelector({ className, variant = "dropdown" }: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex h-10 min-w-[7.5rem] shrink-0 rounded-full border border-border bg-surface-elevated",
          variant === "pills" && "h-auto min-w-0 border-0 bg-transparent",
          className,
        )}
        aria-hidden
      />
    );
  }

  const current = (theme ?? "system") as ThemeOption;
  const iconMode: "light" | "dark" | "system" =
    current === "system" ? "system" : current === "dark" ? "dark" : "light";

  if (variant === "pills") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Appearance</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color theme">
          {options.map((opt) => {
            const selected = current === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                  selected
                    ? "border-synergy bg-synergy-muted text-synergy-light dark:text-synergy-glow"
                    : "border-border bg-surface-muted text-ink-body hover:border-synergy/40",
                )}
              >
                <ThemeIcon mode={opt.value === "system" ? "system" : opt.value} />
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-ink-muted">
          Active look: {resolvedTheme === "dark" ? "Dark" : "Light"}
          {current === "system" ? " (from system)" : ""}
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 text-sm font-medium text-ink shadow-soft transition hover:border-synergy/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <ThemeIcon mode={iconMode} />
        <span className="hidden sm:inline">
          {options.find((o) => o.value === current)?.label ?? "Theme"}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={cn("text-ink-muted transition", open && "rotate-180")}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Choose theme"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-2xl border border-border bg-surface-elevated p-1.5 shadow-card"
        >
          {options.map((opt) => {
            const selected = current === opt.value;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    selected ? "bg-synergy-muted/80" : "hover:bg-surface-muted",
                  )}
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="mt-0.5 text-ink">
                    <ThemeIcon mode={opt.value === "system" ? "system" : opt.value} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                    <span className="block text-xs text-ink-muted">{opt.description}</span>
                  </span>
                  {selected ? (
                    <span className="text-synergy" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
