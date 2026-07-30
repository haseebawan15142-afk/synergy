export type Industry = {
  slug: string;
  title: string;
  summary: string;
};

export const industries: Industry[] = [
  {
    slug: "smb",
    title: "Small & medium business",
    summary: "Right-sized IT, support, and infrastructure for growing organizations.",
  },
  {
    slug: "education",
    title: "Education",
    summary: "Device lifecycle, labs, and reliable support for institutions.",
  },
  {
    slug: "healthcare",
    title: "Healthcare",
    summary: "Secure, available systems for care delivery — scoped to your compliance needs.",
  },
  {
    slug: "retail-hospitality",
    title: "Retail & hospitality",
    summary: "POS, connectivity, and multi-site operations support.",
  },
  {
    slug: "government",
    title: "Government & public sector",
    summary: "Enterprise solutions for public-sector and regulated environments.",
  },
];
