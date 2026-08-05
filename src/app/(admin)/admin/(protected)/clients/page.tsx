import type { Metadata } from "next";
import { ClientsManager } from "@/components/admin/modules/ClientsManager";

export const metadata: Metadata = { title: "Clients" };

export default function Page() {
  return <ClientsManager />;
}
