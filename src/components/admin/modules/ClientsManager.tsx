"use client";

import type { ClientDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
import { slugify } from "@/lib/admin/crud";

const fields: CrudField[] = [
  { key: "name", label: "Name", required: true },
  { key: "slug", label: "Slug" },
  { key: "logoUrl", label: "Logo", type: "media", folder: "clients", required: true },
  { key: "website", label: "Website" },
  { key: "category", label: "Category" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured (homepage)", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function ClientsManager() {
  return (
    <CrudManager<ClientDoc>
      title="Clients"
      description="Homepage Selected Clientele. Upload high-quality transparent logos only. Active ON replaces local defaults — never keep old solid-white / low-quality marks."
      collection={COLLECTIONS.clients}
      fields={fields}
      empty="No clients"
      initial={{
        name: "",
        slug: "",
        logoUrl: "",
        website: "",
        category: "Selected Clientele",
        sortOrder: 0,
        featured: true,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.name),
        logoUrl: form.logoUrl || "",
        website: form.website || "",
        category: form.category || "Selected Clientele",
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        featured: form.featured !== false,
        active: form.active !== false,
      })}
    />
  );
}
