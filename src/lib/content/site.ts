export const siteConfig = {
  name: "Synergy Computers",
  legalName: "Synergy Computers (Pvt.) Ltd.",
  description:
    "Trusted technology partner in Pakistan since 1981 — infrastructure, enterprise applications, system integration, cybersecurity, and support. We Do IT Better.",
  url: "https://synergy.net.pk",
  email: "info@synergy.net.pk",
  phoneDisplay: "021-34527060",
  phoneTel: "+922134527060",
  phones: ["021-34527060", "021-34540908", "021-34547068"],
  fax: "021-34540907",
  address: {
    line: "56-D, K.D.A Scheme No.1 Main Miran M. Shah Road",
    city: "Karachi",
    country: "Pakistan",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/synergy-computers/",
    // TODO: Confirm Facebook slug spelling with marketing (existing site URL retained).
    facebook: "https://www.facebook.com/SynergyCompuetsPvtLtd/",
  },
  nav: [
    { label: "Services", href: "/services" },
    { label: "Industries", href: "/industries" },
    { label: "Partners", href: "/partners" },
    {
      label: "About",
      href: "/about",
      children: [
        {
          label: "Who We Are",
          href: "/about#who-we-are",
          description: "Our story since 1981 — trusted technology partner across Pakistan.",
          icon: "building",
        },
        {
          label: "Board of Directors",
          href: "/about#board",
          description: "Governance leadership as listed in the company profile.",
          icon: "users",
        },
        {
          label: "Our Leadership",
          href: "/about#leadership",
          description: "Meet the team steering Synergy's strategy and client relationships.",
          icon: "users",
        },
        {
          label: "Our Accomplishments",
          href: "/about#accomplishments",
          description: "Milestones and recognitions across four decades of enterprise IT.",
          icon: "award",
        },
      ],
    },
    { label: "Careers", href: "/careers" },
    { label: "Resources", href: "/resources" },
  ],
} as const;
