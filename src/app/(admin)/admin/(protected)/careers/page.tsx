import type { Metadata } from "next";
import { CareersManager } from "@/components/admin/modules/CareersManager";

export const metadata: Metadata = { title: "Careers" };

export default function Page() {
  return <CareersManager />;
}
