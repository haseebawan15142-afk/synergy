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
      description="Firebase owns services site-wide: homepage Problems we solve, /services list, detail pages, and Insights nav. Keep Status = published and Active ON for a service to appear."
      collection={COLLECTIONS.services}
      fields={fields}
      empty="No services — add one or seed from local content"
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
        imageUrl: "",
        bannerUrl: "",
        heroImageUrl: "",
        sortOrder: 0,
        featured: false,
        status: "published",
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.title),
        shortDescription: form.shortDescription || "",
        description: form.description || "",
        headline: form.headline || "",
        lead: form.lead || "",
        challenge: form.challenge || "",
        approach: form.approach || "",
        benefits: form.benefits || "",
        imageUrl: form.imageUrl || "",
        bannerUrl: form.bannerUrl || "",
        heroImageUrl: form.heroImageUrl || "",
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        status: form.status || "published",
        active: form.active !== false,
        featured: form.featured === true,
      })}
    />
  );
}
