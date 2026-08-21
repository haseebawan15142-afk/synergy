import { NewsletterEditions } from "@/components/newsletter/NewsletterEditions";
import { NewsletterHero } from "@/components/newsletter/NewsletterHero";
import { fetchNewsletterIssues } from "@/lib/cms/public-server";

export const metadata = {
  title: "Newsletter",
  description:
    "Synergy Computers newsletter — Dynatrace partnership, data platforms, and enterprise IT updates for Pakistan.",
};

/** Pick up admin CMS newsletter changes without a full redeploy. */
export const revalidate = 60;

export default async function NewsletterPage() {
  const issues = await fetchNewsletterIssues();

  return (
    <>
      <NewsletterHero />
      <div className="page-container section-y-tight">
        <NewsletterEditions issues={issues} />
      </div>
    </>
  );
}
