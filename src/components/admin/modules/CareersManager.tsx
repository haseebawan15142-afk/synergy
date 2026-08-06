"use client";

import type { CareerDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { slugify } from "@/lib/admin/crud";
import { CrudManager, type CrudField } from "./CrudManager";

const fields: CrudField[] = [
  { key: "title", label: "Title", required: true },
  { key: "slug", label: "Slug" },
  { key: "department", label: "Department", required: true },
  { key: "location", label: "Location", required: true },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: ["Full-time", "Internship", "Contract"],
  },
  { key: "salary", label: "Salary" },
  { key: "experience", label: "Experience" },
  { key: "skills", label: "Skills (comma-separated)" },
  { key: "description", label: "Description", type: "textarea", required: true },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["open", "closed", "draft"],
  },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function CareersManager() {
  return (
    <CrudManager<CareerDoc & { skills?: string[] | string }>
      title="Careers"
      description="Open jobs on /careers. Status must be Open + Active. Once any job is open in Firebase, local seed jobs are hidden."
      collection={COLLECTIONS.careers}
      fields={fields}
      empty="No career openings"
      initial={{
        title: "",
        slug: "",
        department: "",
        location: "",
        type: "Full-time",
        skills: [],
        description: "",
        status: "open",
        sortOrder: 0,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.title),
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        skills: Array.isArray(form.skills)
          ? form.skills
          : String(form.skills || "")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
        salary: form.salary || "",
        experience: form.experience || "",
        status: form.status || "open",
        active: form.active !== false,
      })}
    />
  );
}
