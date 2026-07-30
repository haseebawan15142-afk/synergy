"use client";

import dynamic from "next/dynamic";

const PremiumBackdrop = dynamic(
  () => import("@/components/effects/PremiumBackdrop").then((m) => m.PremiumBackdrop),
  { ssr: false },
);

const GsapScrollEffects = dynamic(
  () => import("@/components/effects/GsapScrollEffects").then((m) => m.GsapScrollEffects),
  { ssr: false },
);

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false, loading: () => null },
);

export function ClientEffects() {
  return (
    <>
      <PremiumBackdrop />
      <GsapScrollEffects />
      <ChatWidget />
    </>
  );
}
