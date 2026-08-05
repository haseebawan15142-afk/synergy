"use client";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, type CrudField } from "./CrudManager";

type PartnerDoc = {
  id?: string;
  name: string;
  logoUrl?: string;
  website?: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
};

const fields: CrudField[] = [
  { key: "name", label: "Name", required: true },
  { key: "logoUrl", label: "Logo", type: "media", folder: "partners" },
  { key: "website", label: "Website URL" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "featured", label: "Featured", type: "checkbox" },
  { key: "active", label: "Active", type: "checkbox" },
];

export function PartnersManager() {
  return (
    <CrudManager<PartnerDoc>
      title="Partners"
      description="Technology partners shown on the Partners page and homepage."
      collection={COLLECTIONS.partners}
      fields={fields}
      empty="No partners"
      initial={{
        name: "",
        logoUrl: "",
        website: "",
        sortOrder: 0,
        featured: true,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        logoUrl: form.logoUrl || "",
        website: form.website || "",
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
      })}
    />
  );
}
