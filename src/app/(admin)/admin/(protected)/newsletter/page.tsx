import type { Metadata } from "next";
import { NewsletterManager } from "@/components/admin/modules/NewsletterManager";

export const metadata: Metadata = { title: "Newsletter Subscribers" };

export default function Page() {
  return <NewsletterManager />;
}
