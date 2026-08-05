"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PremiumBackdrop = dynamic(
  () => import("@/components/effects/PremiumBackdrop").then((m) => m.PremiumBackdrop),
  { ssr: false, loading: () => null },
);

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null },
);

/** Defer non-critical UI so first paint / navigation stay responsive. */
function useDeferredMount(ms = 1200) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const start = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(start, { timeout: ms });
    } else {
      timeoutId = window.setTimeout(start, ms);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [ms]);
  return ready;
}

export function ClientEffects() {
  const showChat = useDeferredMount(1500);

  return (
    <>
      <PremiumBackdrop />
      {showChat ? <ChatWidget /> : null}
    </>
  );
}
