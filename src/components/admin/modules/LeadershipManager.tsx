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
      title="Board of Directors"
      description="Board members shown on the About page (Company Profile). Edit names, titles, bios, and photos here."
      collection={COLLECTIONS.leadership}
      fields={fields}
      empty="No board members yet"
      initial={{
        name: "",
        designation: "",
        department: "Board of Directors",
        bio: "",
        linkedin: "",
        sortOrder: 0,
        featured: true,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        linkedin: String(form.linkedin || "").trim(),
        email: String(form.email || "").trim(),
        phone: String(form.phone || "").trim(),
        department: String(form.department || "Board of Directors").trim(),
        photoUrl: String(form.photoUrl || "").trim(),
      })}
    />
  );
}
