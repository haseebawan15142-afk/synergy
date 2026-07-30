export type ServiceIconKey =
  | "network-infrastructure"
  | "managed-it"
  | "data-backup-recovery"
  | "microsoft-365-cloud"
  | "on-site-it-support";

type IconProps = { className?: string };

export function ServiceCategoryIcon({
  name,
  className = "h-6 w-6",
}: {
  name: ServiceIconKey;
  className?: string;
}) {
  const stroke = "currentColor";
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "network-infrastructure":
      return (
        <svg {...props}>
          <path
            d="M4 7h16M4 12h16M4 17h10"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={stroke} strokeWidth="1.75" />
          <circle cx="17" cy="17" r="2" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "managed-it":
      return (
        <svg {...props}>
          <path
            d="M12 3v3M12 18v3M4.22 5.22l2.12 2.12M17.66 16.66l2.12 2.12M3 12h3M18 12h3M4.22 18.78l2.12-2.12M17.66 7.34l2.12-2.12"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="1.75" />
        </svg>
      );
    case "data-backup-recovery":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="6" rx="7" ry="3" stroke={stroke} strokeWidth="1.75" />
          <path
            d="M5 6v4c0 1.66 3.13 3 7 3s7-1.34 7-3V6M5 10v4c0 1.66 3.13 3 7 3s7-1.34 7-3v-4"
            stroke={stroke}
            strokeWidth="1.75"
          />
          <path
            d="M12 13v5M9 16l3 3 3-3"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "microsoft-365-cloud":
      return (
        <svg {...props}>
          <path
            d="M7 18a4 4 0 1 1 0-8 5.5 5.5 0 0 1 10.6-1.3A3.5 3.5 0 1 1 19 18H7z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 11v4M10 13h4"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "on-site-it-support":
      return (
        <svg {...props}>
          <path
            d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10z"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="11" r="2" stroke={stroke} strokeWidth="1.75" />
          <path
            d="M9.5 14.5L8 20h8l-1.5-5.5"
            stroke={stroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function isServiceIconKey(slug: string): slug is ServiceIconKey {
  return (
    slug === "network-infrastructure" ||
    slug === "managed-it" ||
    slug === "data-backup-recovery" ||
    slug === "microsoft-365-cloud" ||
    slug === "on-site-it-support"
  );
}
