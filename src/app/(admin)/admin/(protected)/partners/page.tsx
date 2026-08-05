import type { Metadata } from "next";
import { PartnersManager } from "@/components/admin/modules/PartnersManager";

export const metadata: Metadata = { title: "Partners" };

export default function Page() {
  return <PartnersManager />;
}
