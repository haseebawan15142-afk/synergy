import type { Metadata } from "next";
import { BlogsManager } from "@/components/admin/modules/BlogsManager";

export const metadata: Metadata = { title: "Blogs" };

export default function Page() {
  return <BlogsManager />;
}
