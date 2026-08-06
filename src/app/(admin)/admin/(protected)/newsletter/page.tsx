import type { Metadata } from "next";
import { NewsletterAdmin } from "@/components/admin/modules/NewsletterAdmin";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <NewsletterAdmin />;
}
