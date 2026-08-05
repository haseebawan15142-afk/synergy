import type { Metadata } from "next";
import { TestimonialsManager } from "@/components/admin/modules/TestimonialsManager";

export const metadata: Metadata = { title: "Testimonials" };

export default function Page() {
  return <TestimonialsManager />;
}
