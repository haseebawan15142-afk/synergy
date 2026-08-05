"use client";
import type { LeadershipDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
const fields: CrudField[] = [
  { key: "name", label: "Name", required: true },
  { key: "designation", label: "Designation", required: true },
  { key: "department", label: "Department" },
  { key: "bio", label: "Bio", type: "textarea", required: true },
  { key: "photoUrl", label: "Photo", type: "media", folder: "leadership" },
  { key: "linkedin", label: "LinkedIn profile URL" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function LeadershipManager() {
  return (
    <CrudManager<LeadershipDoc>
      title="Leadership"
      description="Manage leadership profiles and display order. LinkedIn URLs appear as icons on the About page."
      collection={COLLECTIONS.leadership}
      fields={fields}
      empty="No leadership profiles"
      initial={{
        name: "",
        designation: "",
        bio: "",
        linkedin: "",
        sortOrder: 0,
        featured: false,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        linkedin: String(form.linkedin || "").trim(),
        email: String(form.email || "").trim(),
        phone: String(form.phone || "").trim(),
        department: String(form.department || "").trim(),
        photoUrl: String(form.photoUrl || "").trim(),
      })}
    />
  );
}
