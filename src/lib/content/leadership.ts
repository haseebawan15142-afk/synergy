/**
 * Leadership team shown on /about under "Our Leadership".
 * Photos live in `public/images/leadership/` — set `photoSrc` to that path,
 * or leave it `null` to show initials instead.
 */
export type LeadershipMember = {
  name: string;
  title: string;
  bio: string;
  photoSrc: string | null;
};

export const leadershipTeam: LeadershipMember[] = [
  {
    name: "Amanullah Khan",
    title: "Chief Executive Officer",
    bio: "Sets the company's strategic direction and oversees Synergy's enterprise partnerships across banking, energy, and public sector clients.",
    photoSrc: "/images/leadership/ceo.jpg",
  },
  {
    name: "Muneeza Hashmi",
    title: "Chief Operating Officer",
    bio: "Leads day-to-day operations, delivery quality, and the 24x7 support organization that keeps client infrastructure running.",
    photoSrc: "/images/leadership/coo.jpg",
  },
  {
    name: "Usman Ali",
    title: "Chief Technology Officer",
    bio: "Drives technical strategy, vendor partnerships, and the engineering standards behind every Synergy deployment.",
    photoSrc: "/images/leadership/cto.jpg",
  },
  {
    name: "Moeen Khan",
    title: "Head of Sales & Business Development",
    bio: "Builds long-term relationships with clients across finance, healthcare, education, and utilities.",
    photoSrc: "/images/leadership/sales-head.jpg",
  },
];
