import type { Metadata } from "next";
import { CaseStudiesManager } from "@/components/admin/modules/CaseStudiesManager";

export const metadata: Metadata = { title: "Case Studies" };

export default function Page() {
  return <CaseStudiesManager />;
}
