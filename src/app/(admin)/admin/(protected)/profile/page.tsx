import type { Metadata } from "next";
import { ProfileView } from "@/components/admin/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function AdminProfilePage() {
  return <ProfileView />;
}
