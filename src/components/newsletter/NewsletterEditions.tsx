import Image from "next/image";
import Link from "next/link";
import type { NewsletterIssue } from "@/lib/content/newsletter-issues";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { Reveal } from "@/components/motion/Reveal";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
}

export function NewsletterEditions({ issues }: { issues: NewsletterIssue[] }) {
  const featured = issues.find((i) => i.featured) ?? issues[0];
  const rest = issues.filter((i) => i.slug !== featured?.slug);

  if (!featured) {
    return (
      <p className="text-ink-muted">Newsletter editions will appear here once published from admin.</p>
    );
  }

  return (
    <div className="space-y-14 sm:space-y-16">
      <Reveal>
        <article className="relative overflow-hidden border-b border-border/60 pb-12 sm:pb-14">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
              <Image
                src={featured.coverUrl}
                alt={featured.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-synergy">
                {featured.topic}
                <span className="mx-2 text-ink-muted">·</span>
                <span className="font-medium tracking-normal text-ink-muted">
                  {formatDate(featured.publishedAt)}
                </span>
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-body sm:text-lg">
                {featured.excerpt}
              </p>
              {featured.body ? (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{featured.body}</p>
              ) : null}
              {featured.href ? (
                <Link
                  href={featured.href}
                  className="mt-6 inline-flex text-sm font-semibold text-synergy hover:underline"
                >
                  Read more →
                </Link>
              ) : null}
            </div>
          </div>
        </article>
      </Reveal>

      {rest.length > 0 ? (
        <section aria-labelledby="more-editions">
          <Reveal>
            <h2 id="more-editions" className="text-xl font-bold text-ink sm:text-2xl">
              More editions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">
              Partner spotlights and technology updates from Synergy Computers.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((issue, index) => (
              <li key={issue.slug}>
                <Reveal delay={index * 0.04}>
                  <article className="group h-full">
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                      <Image
                        src={issue.coverUrl}
                        alt={issue.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-synergy">
                      {issue.topic}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-ink">
                      {issue.href ? (
                        <Link href={issue.href} className="hover:text-synergy">
                          {issue.title}
                        </Link>
                      ) : (
                        issue.title
                      )}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-body">{issue.excerpt}</p>
                    <p className="mt-3 text-xs text-ink-muted">{formatDate(issue.publishedAt)}</p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Reveal>
        <div className="border-t border-border/60 pt-10 sm:pt-12">
          <h2 className="text-xl font-bold text-ink">Stay in the loop</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted sm:text-base">
            Subscribe for partner news, service updates, and enterprise IT insights from Synergy.
          </p>
          <div className="mt-5 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
