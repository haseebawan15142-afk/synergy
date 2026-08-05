import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/modules/GalleryManager";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <GalleryManager />;
}
