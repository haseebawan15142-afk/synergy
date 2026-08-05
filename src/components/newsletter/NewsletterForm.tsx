"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Button } from "@/components/ui/Button";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(getFirebaseDb(), COLLECTIONS.newsletter), {
        email: email.trim().toLowerCase(),
        status: "active",
        createdAt: serverTimestamp(),
      });
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
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
        />
        <Button type="submit" loading={loading} className="shrink-0">
          Subscribe
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
