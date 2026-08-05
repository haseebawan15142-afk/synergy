import type { Metadata } from "next";
import { AlumniManager } from "@/components/admin/modules/AlumniManager";

export const metadata: Metadata = { title: "Alumni" };

export default function Page() {
  return <AlumniManager />;
}
