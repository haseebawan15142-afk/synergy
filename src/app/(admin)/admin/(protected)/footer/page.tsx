import type { Metadata } from "next";
import { FooterManager } from "@/components/admin/modules/FooterManager";

export const metadata: Metadata = { title: "Footer" };

export default function Page() {
  return <FooterManager />;
}
