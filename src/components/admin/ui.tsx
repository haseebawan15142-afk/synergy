"use client";

import { cn } from "@/lib/cn";

export const inputClass =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none ring-synergy/30 transition focus:border-synergy focus:ring-2";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-border bg-surface-elevated p-5 shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-lg bg-synergy px-4 py-2 text-sm font-semibold text-white transition hover:bg-synergy-dark disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-synergy/40 hover:bg-synergy-muted/40 disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "published" || status === "open" || status === "active" || status === "replied"
      ? "bg-synergy-muted text-synergy-dark"
      : status === "draft" || status === "scheduled" || status === "unread"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : "bg-surface-muted text-ink-muted";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", tone)}>
      {status}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{description}</p>
    </div>
  );
}
