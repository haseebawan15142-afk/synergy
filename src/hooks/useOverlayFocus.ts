"use client";

import { useEffect, useRef, type RefObject } from "react";
import { focusElement, getFocusableElements, trapTabKey } from "@/lib/a11y/focus";

type UseOverlayFocusOptions = {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Element that opened the overlay — focus returns here on close. */
  triggerRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  /** When true, Tab cycles inside the container (dialogs / drawers). */
  trapFocus?: boolean;
  /** Focus the first focusable (or container) when opened. */
  initialFocus?: boolean;
};

/**
 * Escape-to-close, optional focus trap, initial focus, and restore on close.
 * Visual behavior is unchanged — keyboard/AT only.
 */
export function useOverlayFocus({
  open,
  containerRef,
  triggerRef,
  onEscape,
  trapFocus = true,
  initialFocus = true,
}: UseOverlayFocusOptions) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      (document.activeElement instanceof HTMLElement ? document.activeElement : null) ?? null;

    let focusRaf1 = 0;
    let focusRaf2 = 0;
    if (initialFocus) {
      // Double rAF so AnimatePresence can mount the overlay before focusing.
      focusRaf1 = requestAnimationFrame(() => {
        focusRaf2 = requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) return;
          const focusable = getFocusableElements(container);
          focusElement(focusable[0] ?? container);
        });
      });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onEscapeRef.current?.();
        return;
      }
      const root = containerRef.current;
      if (trapFocus && root) {
        trapTabKey(root, event);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusRaf1);
      cancelAnimationFrame(focusRaf2);
      document.removeEventListener("keydown", onKeyDown);
      const restore = triggerRef?.current ?? previouslyFocused.current;
      requestAnimationFrame(() => focusElement(restore));
    };
  }, [open, containerRef, triggerRef, trapFocus, initialFocus]);
}
