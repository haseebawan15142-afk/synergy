import type { Metadata } from "next";
import { LeadershipManager } from "@/components/admin/modules/LeadershipManager";

export const metadata: Metadata = { title: "Leadership" };

export default function Page() {
  return <LeadershipManager />;
}
