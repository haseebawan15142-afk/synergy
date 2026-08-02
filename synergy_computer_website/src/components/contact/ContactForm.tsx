"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion/variants";
import { motionDurations, motionEase } from "@/lib/motion/transitions";

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-ink shadow-soft transition focus:border-synergy focus:outline-none focus:ring-2 focus:ring-synergy/20";

export function ContactForm() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  }

  return (
    <form
      className="rounded-2xl border border-border/80 bg-surface-elevated p-6 shadow-soft sm:p-8"
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
              We&apos;ll connect this form to email (SMTP) soon. Your details were not sent yet.
            </p>
          </motion.div>
        ) : (
          <motion.div key="fields" initial={false} animate={{ opacity: 1 }}>
            <p className="text-sm text-ink-muted">
              Form submission will be connected to email (SMTP) in a later step.
            </p>
            <div className="mt-6 space-y-5">
              {(["name", "email", "message"] as const).map((field) => (
                <div key={field} className="group">
                  <label htmlFor={field} className="block text-sm font-semibold text-ink transition-colors group-focus-within:text-synergy">
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
