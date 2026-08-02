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
    {
      label: "About",
      href: "/about",
      children: [
        {
          label: "Who We Are",
          href: "/about#who-we-are",
          description: "Our story, vision, and mission since the early days of Pakistan's IT industry.",
          icon: "building",
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
          description: "Milestones, certifications, and recognitions earned over 40+ years.",
          icon: "award",
        },
      ],
    },
    { label: "Resources", href: "/resources" },
  ],
} as const;
