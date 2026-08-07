"use client";

import type { OfficeDoc } from "@/lib/admin/types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CrudManager, parseListField, type CrudField } from "./CrudManager";

const fields: CrudField[] = [
  { key: "label", label: "Label (e.g. Karachi — Head Office)", required: true },
  { key: "city", label: "City", required: true },
  { key: "country", label: "Country", required: true },
  { key: "addressLines", label: "Address lines (one per line)", type: "list", required: true },
  { key: "phones", label: "Phones (one per line)", type: "list" },
  { key: "fax", label: "Fax" },
  { key: "email", label: "Email", required: true },
  { key: "website", label: "Website" },
  { key: "landmarkName", label: "Landmark name" },
  { key: "landmarkImageUrl", label: "Landmark pin image", type: "media", folder: "offices" },
  {
    key: "landmarkBackgroundUrl",
    label: "Landmark card background (wide photo)",
    type: "media",
    folder: "offices",
  },
  { key: "lat", label: "Latitude (OpenStreetMap)", type: "number", required: true },
  { key: "lng", label: "Longitude (OpenStreetMap)", type: "number", required: true },
  { key: "mapX", label: "Map pin X %", type: "number" },
  { key: "mapY", label: "Map pin Y %", type: "number" },
  { key: "sortOrder", label: "Sort order", type: "number" },
  { key: "isHeadOffice", label: "Head office", type: "checkbox" },
  { key: "addressPending", label: "Address pending", type: "checkbox" },
  { key: "active", label: "Active (shown on site)", type: "checkbox" },
];

export function OfficesManager() {
  return (
    <CrudManager<OfficeDoc>
      title="Offices"
      description="Contact page map pins and office cards. Pakistan offices need mapX/mapY (%). Changes apply on /contact after save."
      collection={COLLECTIONS.offices}
      fields={fields}
      empty="No offices — run npm run cms:seed-offices or add one"
      initial={{
        label: "",
        city: "",
        country: "Pakistan",
        addressLines: [],
        phones: [],
        fax: "",
        email: "info@synergy.net.pk",
        website: "https://www.synergy.net.pk",
        landmarkName: "",
        landmarkImageUrl: "",
        landmarkBackgroundUrl: "",
        lat: 0,
        lng: 0,
        mapX: 50,
        mapY: 50,
        sortOrder: 0,
        isHeadOffice: false,
        addressPending: false,
        active: true,
      }}
      normalize={(form) => ({
        ...form,
        addressLines: parseListField(form.addressLines),
        phones: parseListField(form.phones),
        fax: form.fax || "",
        website: form.website || "",
        landmarkName: form.landmarkName || "",
        landmarkImageUrl: form.landmarkImageUrl || "",
        landmarkBackgroundUrl: form.landmarkBackgroundUrl || "",
        lat: typeof form.lat === "number" ? form.lat : Number(form.lat) || 0,
        lng: typeof form.lng === "number" ? form.lng : Number(form.lng) || 0,
        mapX: typeof form.mapX === "number" ? form.mapX : Number(form.mapX) || undefined,
        mapY: typeof form.mapY === "number" ? form.mapY : Number(form.mapY) || undefined,
        sortOrder: typeof form.sortOrder === "number" ? form.sortOrder : 0,
        isHeadOffice: form.isHeadOffice === true,
        addressPending: form.addressPending === true,
        active: form.active !== false,
      })}
    />
  );
}
