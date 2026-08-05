import type { Metadata } from "next";
import { SeoManager } from "@/components/admin/modules/SeoManager";

export const metadata: Metadata = { title: "SEO Manager" };

export default function Page() {
  return <SeoManager />;
}
