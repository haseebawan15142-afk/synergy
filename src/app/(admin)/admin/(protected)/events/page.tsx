import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/modules/EventsManager";

export const metadata: Metadata = { title: "Events" };

export default function Page() {
  return <EventsManager />;
}
