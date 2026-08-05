import type { Metadata } from "next";
import { WebsiteSettingsForm } from "@/components/admin/WebsiteSettingsForm";

export const metadata: Metadata = { title: "Website Settings" };

export default function AdminSettingsPage() {
  return <WebsiteSettingsForm />;
}
