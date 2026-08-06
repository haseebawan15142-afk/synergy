"use client";

import type { ServiceDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";
import { slugify } from "@/lib/admin/crud";

const fields: CrudField[] = [
  { key: "title", label: "Title", required: true },
  { key: "slug", label: "Slug", required: true },
  { key: "shortDescription", label: "Short description (cards / listing)", type: "textarea", required: true },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "headline", label: "Detail headline", type: "textarea" },
  { key: "lead", label: "Detail lead paragraph", type: "textarea" },
  { key: "challenge", label: "The Challenge", type: "textarea" },
  { key: "approach", label: "Our Approach", type: "textarea" },
  { key: "benefits", label: "The Benefits", type: "textarea" },
  {
    key: "capabilities",
    label: "Capabilities (one per line: Title | Description)",
    type: "list",
  },
  {
    key: "outcomes",
    label: "Outcomes (one per line: Title | Description)",
    type: "list",
  },
  { key: "icon", label: "Icon" },
  { key: "imageUrl", label: "Card image", type: "media", folder: "services" },
  { key: "bannerUrl", label: "Banner", type: "media", folder: "services" },
  { key: "heroImageUrl", label: "Detail hero background", type: "media", folder: "services/heroes" },
  { key: "category", label: "Category" },
  { key: "seoTitle", label: "SEO title" },
  { key: "seoDescription", label: "SEO description", type: "textarea" },
  { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function ServicesManager() {
  return (
    <CrudManager<ServiceDoc>
      title="Services"
      description="Service listing cards and full /services/[slug] detail pages (challenge, approach, benefits, capabilities, outcomes, hero)."
      collection={COLLECTIONS.services}
      fields={fields}
      empty="No services"
      initial={{
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        headline: "",
        lead: "",
        challenge: "",
        approach: "",
        benefits: "",
        capabilities: [],
        outcomes: [],
        heroImageUrl: "",
        sortOrder: 0,
        featured: false,
        status: "draft",
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.title),
        headline: form.headline || "",
        lead: form.lead || "",
        challenge: form.challenge || "",
        approach: form.approach || "",
        benefits: form.benefits || "",
        heroImageUrl: form.heroImageUrl || "",
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
      })}
    />
  );
}
