export const siteConfig = {
  name: "Synergy Computers",
  legalName: "Synergy Computers (Pvt.) Ltd.",
  description:
    "Pakistan's premium IT solutions provider — infrastructure, enterprise applications, security, and 24×7 support for over 40 years.",
  url: "https://synergy.net.pk",
  email: "info@synergy.net.pk",
  phoneDisplay: "021-34527060",
  phoneTel: "+922134527060",
  phones: ["021-34527060", "021-34540908", "021-34547068"],
  address: {
    line: "56-D, K.D.A Scheme No.1 Main Miran Muhammad Shah Road",
    city: "Karachi",
    country: "Pakistan",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/synergy-computers/",
    facebook: "https://www.facebook.com/SynergyCompuetsPvtLtd/",
  },
  nav: [
    { label: "Services", href: "/services" },
    { label: "Industries", href: "/industries" },
    { label: "Partners", href: "/partners" },
    { label: "About", href: "/about" },
    { label: "Resources", href: "/resources" },
  ],
} as const;
