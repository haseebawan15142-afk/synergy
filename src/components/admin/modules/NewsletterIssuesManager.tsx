"use client";

import type { NewsletterIssueDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { slugify } from "@/lib/admin/crud";
import { CrudManager, type CrudField } from "./CrudManager";

const fields: CrudField[] = [
  { key: "title", label: "Title", required: true },
  { key: "slug", label: "Slug" },
  { key: "topic", label: "Topic", required: true },
  { key: "excerpt", label: "Excerpt", type: "textarea", required: true },
  { key: "body", label: "Body", type: "textarea" },
  { key: "coverUrl", label: "Cover image", type: "media", folder: "newsletter", required: true },
  { key: "href", label: "Link (partner / article URL)" },
  { key: "publishedAt", label: "Published date", type: "date" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured (hero on /newsletter)", type: "checkbox" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["draft", "published", "archived"],
    required: true,
  },
  { key: "active", label: "Active", type: "checkbox" },
];

export function NewsletterIssuesManager() {
  return (
    <CrudManager<NewsletterIssueDoc>
      title="Newsletter editions"
      description="Content shown on the public /newsletter page. Add, edit, or remove editions anytime — featured item appears as the hero."
      collection={COLLECTIONS.newsletterIssues}
      fields={fields}
      empty="No newsletter editions"
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        body: "",
        coverUrl: "",
        topic: "",
        href: "",
        featured: false,
        sortOrder: 0,
        status: "published",
        publishedAt: new Date().toISOString().slice(0, 10),
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        slug: form.slug || slugify(form.title),
        topic: form.topic || "Update",
        excerpt: form.excerpt || "",
        body: form.body || "",
        coverUrl: form.coverUrl || "",
        href: form.href || "",
        featured: form.featured === true,
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        status: form.status || "published",
        publishedAt: form.publishedAt || new Date().toISOString().slice(0, 10),
        active: form.active !== false,
      })}
    />
  );
}
