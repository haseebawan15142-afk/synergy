import type { Metadata } from "next";
import { NavigationManager } from "@/components/admin/modules/NavigationManager";

export const metadata: Metadata = { title: "Navigation Menu" };

export default function Page() {
  return <NavigationManager />;
}
