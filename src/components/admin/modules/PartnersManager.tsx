"use client";

import type { PartnerDoc } from "@/lib/admin/types";
import { slugify } from "@/lib/admin/crud";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";

const fields: CrudField[] = [
  { key: "name", label: "Name", required: true },
  { key: "slug", label: "Slug" },
  { key: "logoUrl", label: "Logo", type: "media", folder: "partners" },
  { key: "website", label: "Website URL" },
  { key: "heroImageUrl", label: "Detail hero image", type: "media", folder: "partners/hero" },
  {
    key: "taglines",
    label: "Hero taglines (one per line, 1–3)",
    type: "list",
  },
  { key: "shortDescription", label: "Short description", type: "textarea" },
  { key: "overview", label: "Overview", type: "textarea" },
  {
    key: "keySolutions",
    label: "Key solutions & services (one per line)",
    type: "list",
  },
  { key: "category", label: "Category" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function PartnersManager() {
  return (
    <CrudManager<PartnerDoc>
      title="Partners"
      description="Technology partners shown on the Partners page, homepage, and /partners/[slug] detail pages."
      collection={COLLECTIONS.partners}
      fields={fields}
      empty="No partners"
      initial={{
        name: "",
        slug: "",
        logoUrl: "",
        website: "",
        heroImageUrl: "",
        taglines: [],
        shortDescription: "",
        overview: "",
        keySolutions: [],
        category: "",
        sortOrder: 0,
        featured: true,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.name),
        logoUrl: form.logoUrl || "",
        website: form.website || "",
        heroImageUrl: form.heroImageUrl || "",
        shortDescription: form.shortDescription || "",
        overview: form.overview || "",
        category: form.category || "",
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
      })}
    />
  );
}
