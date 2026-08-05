import type { Metadata } from "next";
import { ServicesManager } from "@/components/admin/modules/ServicesManager";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesManager />;
}
