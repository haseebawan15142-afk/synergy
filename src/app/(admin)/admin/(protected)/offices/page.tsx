import type { Metadata } from "next";
import { OfficesManager } from "@/components/admin/modules/OfficesManager";

export const metadata: Metadata = { title: "Offices" };

export default function Page() {
  return <OfficesManager />;
}
