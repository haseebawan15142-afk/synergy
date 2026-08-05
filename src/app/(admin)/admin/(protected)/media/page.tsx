import type { Metadata } from "next";
import { MediaLibraryView } from "@/components/admin/MediaLibraryView";

export const metadata: Metadata = { title: "Media Library" };

export default function Page() {
  return <MediaLibraryView />;
}
