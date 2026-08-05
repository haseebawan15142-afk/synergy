import type { Metadata } from "next";
import { MessagesManager } from "@/components/admin/modules/MessagesManager";

export const metadata: Metadata = { title: "Contact Messages" };

export default function Page() {
  return <MessagesManager />;
}
