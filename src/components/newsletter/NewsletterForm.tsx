"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const honeypotId = useId();
  const errorId = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const companyWebsite = String(data.get("companyWebsite") || "");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          companyWebsite,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        retryAfterSec?: number;
      };

      if (res.status === 429) {
        throw new Error(
          `Too many attempts. Please try again in ${payload.retryAfterSec ?? 60} seconds.`,
        );
      }
      if (!res.ok || !payload.ok) {
        throw new Error(
          payload.error === "invalid_email"
            ? "Please enter a valid email address."
            : "Subscribe failed",
        );
      }
      setDone(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscribe failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <p className="text-sm text-ink-muted">Thanks for subscribing.</p>;
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={honeypotId}>Company website</label>
        <input
          id={honeypotId}
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={emailId}>
          Email address
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          aria-label="Email address"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
        />
        <Button type="submit" loading={loading} className="shrink-0">
          Subscribe
        </Button>
      </div>
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
