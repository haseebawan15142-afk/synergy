import type { Metadata } from "next";
import { LeadershipManager } from "@/components/admin/modules/LeadershipManager";

export const metadata: Metadata = { title: "Board of Directors" };

export default function Page() {
  return <LeadershipManager />;
}
