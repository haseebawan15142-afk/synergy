import type { Metadata } from "next";
import { FaqManager } from "@/components/admin/modules/FaqManager";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return <FaqManager />;
}
