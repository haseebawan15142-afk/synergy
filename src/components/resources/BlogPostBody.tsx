import Link from "next/link";
import { getBlogBody } from "@/lib/content/blog-bodies";

type BlogPostBodyProps = {
  slug: string;
  legacyUrl: string;
};

export function BlogPostBody({ slug, legacyUrl }: BlogPostBodyProps) {
  const blocks = getBlogBody(slug);

  if (!blocks?.length) {
    return (
      <div className="space-y-4 text-ink-body">
        <p>
          Full article text is being migrated from our previous site. You can read this article on
          the legacy site while we finish the transfer.
        </p>
        <a
          href={legacyUrl}
          className="inline-flex font-semibold text-synergy hover:text-synergy-dark"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on synergy.net.pk →
        </a>
      </div>
    );
  }

  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-ink prose-p:text-ink-body prose-a:text-synergy">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-8 text-xl font-semibold text-ink first:mt-0">
              {block.slice(3)}
            </h2>
          );
        }
        return (
          <p key={i} className="mt-4 text-ink-body leading-relaxed">
            {block}
          </p>
        );
      })}
      <p className="mt-10 border-t border-border pt-6 text-sm text-ink-muted">
        Originally published on{" "}
        <a href={legacyUrl} className="text-synergy hover:underline" target="_blank" rel="noopener noreferrer">
          synergy.net.pk
        </a>
        .{" "}
        <Link href="/contact" className="font-semibold text-synergy hover:underline">
          Contact us
        </Link>{" "}
        for implementation and support in Pakistan.
      </p>
    </div>
  );
}
