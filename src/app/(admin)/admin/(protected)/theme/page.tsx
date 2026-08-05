import type { Metadata } from "next";
import { ThemeManager } from "@/components/admin/modules/ThemeManager";

export const metadata: Metadata = { title: "Theme Customizer" };

export default function Page() {
  return <ThemeManager />;
}
