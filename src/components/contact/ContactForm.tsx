"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion/variants";
import { motionDurations, motionEase } from "@/lib/motion/transitions";
import { getFirebaseDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink shadow-soft transition focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20";

type ContactFormProps = {
  intro?: string;
  /** Skip outer card chrome when parent already provides a panel. */
  bare?: boolean;
};

export function ContactForm({
  intro = "Send a message and we'll respond as soon as we can.",
  bare = false,
}: ContactFormProps) {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    try {
      await addDoc(collection(getFirebaseDb(), COLLECTIONS.messages), {
        name,
        email,
        message,
        status: "unread",
        replyStatus: "none",
        createdAt: serverTimestamp(),
      });
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={
        bare
          ? "w-full"
          : "rounded-2xl border border-border/80 bg-surface-elevated p-6 shadow-soft sm:p-8"
      }
      onSubmit={handleSubmit}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={fadeUp}
            className="py-8 text-center"
            role="status"
          >
            <motion.div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-synergy-muted text-2xl text-synergy"
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: motionDurations.hover, ease: motionEase }}
              aria-hidden
            >
              ✓
            </motion.div>
            <p className="mt-4 text-lg font-semibold text-ink">Message received</p>
            <p className="mt-2 text-sm text-ink-muted">
              Thanks — your message was saved. Our team will get back to you shortly.
            </p>
          </motion.div>
        ) : (
          <motion.div key="fields" initial={false} animate={{ opacity: 1 }}>
            <p className="text-sm text-ink-muted">{intro}</p>
            {error ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}
            <div className="mt-6 space-y-5">
              {(["name", "email", "message"] as const).map((field) => (
                <div key={field} className="group">
                  <label
                    htmlFor={field}
                    className="block text-sm font-semibold text-ink transition-colors group-focus-within:text-synergy"
                  >
                    {field === "message" ? "Message" : field === "email" ? "Email" : "Name"}
                  </label>
                  {field === "message" ? (
                    <textarea id={field} name={field} rows={5} required className={inputClass} />
                  ) : (
                    <input
                      id={field}
                      name={field}
                      type={field === "email" ? "email" : "text"}
                      required
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" loading={loading}>
                Send message
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
