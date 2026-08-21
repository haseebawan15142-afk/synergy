/**
 * Leadership team shown on /about under "Our Leadership".
 * Photos live in `public/images/leadership/` — set `photoSrc` to that path,
 * or leave it `null` to show initials instead.
 *
 * TODO (Company Profile 2026): Board page lists Mr. Aman Ullah Khan as Chairman
 * and Mr. Iqbal Ahmed as CEO. This ops leadership list still uses prior site titles
 * (Amanullah Khan as CEO). Reconcile with board data when HR confirms.
 */
export type LeadershipMember = {
  name: string;
  title: string;
  bio: string;
  photoSrc: string | null;
  /** Public LinkedIn profile URL from admin CMS (optional). */
  linkedin?: string | null;
};

export const leadershipTeam: LeadershipMember[] = [
  {
    name: "Amanullah Khan",
    title: "Chief Executive Officer",
    bio: "Sets the company's strategic direction and oversees Synergy's enterprise partnerships across banking, energy, and public sector clients.",
    photoSrc: null,
  },
  {
    name: "Muneeza Hashmi",
    title: "Chief Operating Officer",
    bio: "Leads day-to-day operations, delivery quality, and the 24x7 support organization that keeps client infrastructure running.",
    photoSrc: null,
  },
  {
    name: "Usman Ali",
    title: "Chief Technology Officer",
    bio: "Drives technical strategy, vendor partnerships, and the engineering standards behind every Synergy deployment.",
    photoSrc: null,
  },
  {
    name: "Moeen Khan",
    title: "Head of Sales & Business Development",
    bio: "Builds long-term relationships with clients across finance, healthcare, education, and utilities.",
    photoSrc: null,
  },
];
