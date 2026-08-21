"use client";

import type { CaseStudyDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, parseListField, type CrudField } from "./CrudManager";
import { slugify } from "@/lib/admin/crud";

const fields: CrudField[] = [
  { key: "client", label: "Client name", required: true },
  { key: "slug", label: "Slug" },
  { key: "industry", label: "Industry / sector label", required: true },
  { key: "headline", label: "Headline", required: true },
  { key: "summary", label: "Summary", type: "textarea", required: true },
  { key: "imageUrl", label: "Cover image", type: "media", folder: "gallery", required: true },
  { key: "metrics", label: "Metrics (one per line, 3 recommended)", type: "list", required: true },
  { key: "body", label: "Body paragraphs (one per line)", type: "list", required: true },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function CaseStudiesManager() {
  return (
    <CrudManager<CaseStudyDoc>
      title="Case studies"
      description="Homepage outcomes cards are removed. Manage case study pages at /case-studies here. Active published rows replace local seed content."
      collection={COLLECTIONS.caseStudies}
      fields={fields}
      empty="No case studies"
      initial={{
        client: "",
        slug: "",
        industry: "",
        headline: "",
        summary: "",
        imageUrl: "",
        metrics: [],
        body: [],
        sortOrder: 0,
        active: true,
        status: "published",
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.client || form.headline),
        industry: form.industry || "Enterprise",
        imageUrl: form.imageUrl || "",
        metrics: parseListField(form.metrics),
        body: parseListField(form.body),
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        active: form.active !== false,
        status: "published",
      })}
    />
  );
}
