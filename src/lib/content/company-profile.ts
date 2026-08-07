/**
 * Facts sourced only from SCL Company Profile 2026 (PDF).
 * Do not add claims that cannot be traced to that document.
 * See MISSING-CONTENT.md for gaps and TODOs.
 */

export const companyProfileMeta = {
  documentTitle: "SCL — Company Profile — 2026",
  tagline: "We Do IT Better",
  foundedYear: 1981,
  teamSizeLabel: "200+",
  pakistanOfficesLabel: "4",
} as const;

/** About Us — PDF p.2 */
export const aboutUsFromProfile =
  "Synergy Computers (Pvt.) Ltd. has been a trusted technology partner in Pakistan since 1981, delivering secure, innovative, and scalable IT solutions that empower organizations to operate with confidence and agility. Backed by a team of 200+ highly skilled professionals across Karachi, Islamabad, Lahore, and Gilgit, we provide end-to-end technology services spanning enterprise hardware and software, system integration, cloud computing, cybersecurity, IT consultancy, and professional training. Through strong alliances with leading global technology providers, Synergy supports some of the country's most prominent organizations across Banking & Financial Services, Telecommunications, Power & Utilities, Healthcare, Education, Hospitality, and large Enterprise sectors. We enable our customers to modernize their IT landscapes, enhance operational resilience, and accelerate digital transformation ensuring they remain secure, competitive, and future-ready.";

/** Why Synergy / core capabilities — PDF p.22 */
export const whySynergyFromProfile =
  "Synergy Computers (Pvt.) Ltd is a premier technology solutions provider in Pakistan, delivering reliable IT infrastructure, end-to-end system integration, and enterprise-grade services. With decades of experience, we empower organizations to build secure, scalable, and future-ready IT environments that drive operational excellence. At Synergy, we view data as a strategic business asset. Our solutions transform data into actionable insights, enabling faster, smarter decision-making, enhancing efficiency, and supporting sustainable growth. Leveraging strong partnerships with leading global technology vendors, we align technology strategies with business objectives across diverse industries.";

export const coreCapabilities = [
  {
    title: "IT Infrastructure Solutions",
    description: "Scalable, secure, and high-performance systems.",
  },
  {
    title: "Third-Party Software Solutions",
    description: "Enterprise applications and productivity tools.",
  },
  {
    title: "Support, Maintenance & SLAs",
    description: "Proactive services ensuring reliability and uptime.",
  },
  {
    title: "System Integration Services",
    description: "Seamless connectivity across platforms and technologies.",
  },
] as const;

/** Expertise pillars — PDF p.8 */
export const expertisePillars = [
  {
    title: "Infrastructure Solution",
    description:
      "We design future-ready IT infrastructures that drive performance, strengthen security, and scale with your business. Our end-to-end capabilities from data centers to intelligent networking ensure seamless, uninterrupted operations.",
  },
  {
    title: "Support and Services",
    description:
      "Our expert team delivers reliable, end-to-end support through proactive monitoring and rapid issue resolution, ensuring seamless operations and maximum system uptime.",
  },
  {
    title: "Enterprise Application",
    description:
      "We implement and manage powerful enterprise applications tailored to your business needs, enabling digital transformation, intelligent automation, and data-driven decision-making.",
  },
] as const;

/**
 * Board of Directors — PDF p.3.
 * TODO: Site ops leadership (COO/CTO/Sales) is not listed in the PDF board page;
 * keep those profiles separate. PDF titles Aman Ullah Khan as Chairman and
 * Iqbal Ahmed as CEO — conflicts with current /about leadership CMS titles.
 */
export type BoardMember = {
  name: string;
  title: string;
};

export const boardOfDirectors: BoardMember[] = [
  { name: "Mr. Aman Ullah Khan", title: "Chairman" },
  { name: "Mr. Iqbal Ahmed", title: "CEO" },
  { name: "Mr. Tariq Bhatti", title: "Director" },
  { name: "Mr. Innayat Ullah Khan", title: "Director" },
];

export const companyDivisions = [
  "Administration",
  "Human Resource",
  "Finance",
  "Hardware Support & Integration Services",
  "Sales & Marketing — Hardware Sales",
  "Sales & Marketing — Software Sales",
] as const;

export type OfficeLandmark = {
  name: string;
  /** Pin thumbnail / card image */
  image: string;
  /** Optional wide photo for low-opacity card background */
  background?: string;
};

export type OfficeLocation = {
  id: string;
  label: string;
  city: string;
  country: string;
  isHeadOffice?: boolean;
  addressLines: string[];
  phones: string[];
  fax?: string;
  email: string;
  website?: string;
  /** Set when PDF names the city but gives no street address. */
  addressPending?: boolean;
  /** WGS84 coords for free OpenStreetMap marker links. */
  lat: number;
  lng: number;
  /** Pin position on the stylized Pakistan map (percent of map box). */
  mapX?: number;
  mapY?: number;
  landmark?: OfficeLandmark;
};

/** Free OpenStreetMap marker URL — no API key. */
export function officeOsmUrl(office: Pick<OfficeLocation, "lat" | "lng">, zoom = 17) {
  const { lat, lng } = office;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

/** Percentage positions on pakistan-map.webp (tip of pin = city). Responsive across breakpoints. */
export type CityMapPosition = { left: string; top: string };

export const pakistanCityMapPositions: Record<
  "gilgit" | "islamabad" | "lahore" | "karachi",
  CityMapPosition
> = {
  // Gilgit: northern tip, slightly east (right) on the landmass
  gilgit: { left: "63%", top: "14%" },
  islamabad: { left: "53%", top: "40%" },
  lahore: { left: "70%", top: "48%" },
  karachi: { left: "44%", top: "88%" },
};

export const officesIntro =
  "Synergy Computers (Pvt.) Ltd – (SCL) has a strong nationwide footprint with offices in Karachi, Lahore, Islamabad, and Gilgit, ensuring seamless support and service availability across Pakistan.";

/** Nation-wide presence — PDF p.23 */
export const officeLocationsDetailed: OfficeLocation[] = [
  {
    id: "karachi",
    label: "Karachi — Head Office",
    city: "Karachi",
    country: "Pakistan",
    isHeadOffice: true,
    addressLines: [
      "56-D, K.D.A Scheme No.1",
      "Main Miran M. Shah Road",
      "Karachi",
    ],
    phones: ["021-34527060", "021-34540908", "021-34547068"],
    fax: "021-34540907",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 24.8821,
    lng: 67.0642,
    mapX: 44,
    mapY: 88,
    landmark: {
      name: "Mazar-e-Quaid",
      image: "/images/offices/karachi-mazar-e-quaid.webp",
      background: "/images/offices/bg-karachi-mazar.webp",
    },
  },
  {
    id: "islamabad",
    label: "Islamabad Office",
    city: "Islamabad",
    country: "Pakistan",
    addressLines: [
      "Units B & C, Block-1, Diplomatic Enclave G-5",
      "Islamabad",
    ],
    phones: ["051-2828347-9", "051-2822951"],
    fax: "2824125",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 33.7182,
    lng: 73.0674,
    mapX: 53,
    mapY: 40,
    landmark: {
      name: "Faisal Mosque",
      image: "/images/offices/islamabad-faisal-vivid.webp",
      background: "/images/offices/bg-islamabad-faisal.webp",
    },
  },
  {
    id: "lahore",
    label: "Lahore Office",
    city: "Lahore",
    country: "Pakistan",
    addressLines: ["House 130-F, Model Town", "Lahore"],
    phones: ["042-5846575-76", "042-5856475"],
    fax: "042-5856476",
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    lat: 31.4828,
    lng: 74.3214,
    mapX: 70,
    mapY: 48,
    landmark: {
      name: "Minar-e-Pakistan",
      image: "/images/offices/lahore-minar-e-pakistan.webp",
      background: "/images/offices/bg-lahore-minar.webp",
    },
  },
  {
    id: "gilgit",
    label: "Gilgit Office",
    city: "Gilgit",
    country: "Pakistan",
    // PDF lists Gilgit among nationwide offices but does not print a street address.
    addressLines: ["Gilgit"],
    phones: [],
    email: "info@synergy.net.pk",
    website: "https://www.synergy.net.pk",
    addressPending: true,
    lat: 35.9208,
    lng: 74.308,
    mapX: 63,
    mapY: 14,
    landmark: {
      name: "Gilgit",
      image: "/images/offices/gilgit-valley.webp",
      background: "/images/offices/bg-gilgit-valley.webp",
    },
  },
  {
    id: "middle-east",
    label: "Synergy Computers Middle East",
    city: "Ras Al Khaimah",
    country: "United Arab Emirates",
    addressLines: [
      "CWEP0328 Compass Building",
      "Al Shohada Road, Al Hamra Industrial Zone-FZ",
      "Ras Al Khaimah, United Arab Emirates",
      "P.O. Box: 10055",
    ],
    phones: [],
    email: "info@synergy.net.pk",
    website: "https://www.synergy-me.ae",
    lat: 25.6845,
    lng: 55.7782,
    landmark: {
      name: "Ras Al Khaimah",
      image: "/images/offices/ras-al-khaimah.webp",
      background: "/images/offices/bg-rak-coast.webp",
    },
  },
];

export const pakistanOffices = officeLocationsDetailed.filter(
  (office) => office.country === "Pakistan" && office.mapX != null && office.mapY != null,
);

export const internationalOffices = officeLocationsDetailed.filter(
  (office) => office.country !== "Pakistan",
);

/** Homepage / About stats — only PDF-backed figures */
export const profileStats = [
  { value: "1981", label: "Serving Pakistan since" },
  { value: "200+", label: "Skilled professionals" },
  { value: "4", label: "Offices across Pakistan" },
  { value: "40+", label: "Years of enterprise IT" },
] as const;

/** Innovative / Virtua fact — PDF p.14 */
export const virtuaLibrariesFact = {
  worldwide: 178,
  pakistanUnderSynergy: 6,
} as const;
