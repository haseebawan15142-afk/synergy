import type { Metadata } from "next";
import { ThemeAdminPage } from "@/components/admin/modules/ThemeAdminPage";

export const metadata: Metadata = { title: "Theme Customizer" };

export default function Page() {
  return <ThemeAdminPage />;
}
