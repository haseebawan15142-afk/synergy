import Image from "next/image";
import Link from "next/link";

type ServiceDetailHeroProps = {
  title: string;
  summary: string;
  heroImage: string;
};

export function ServiceDetailHero({ title, summary, heroImage }: ServiceDetailHeroProps) {
  return (
    <section className="relative isolate min-h-[min(52vh,520px)] overflow-hidden border-b border-border/40">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 page-container flex min-h-[min(52vh,520px)] flex-col justify-end py-14 sm:py-16 lg:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-white/70">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden className="text-white/40">
              /
            </li>
            <li>
              <Link href="/services" className="transition hover:text-white">
                Services
              </Link>
            </li>
            <li aria-hidden className="text-white/40">
              /
            </li>
            <li className="font-medium text-white">{title}</li>
          </ol>
        </nav>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-synergy-light">
          Synergy Services
        </p>
        <h1 className="mt-3 max-w-3xl text-page-title font-display font-bold text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
          {summary}
        </p>
      </div>
    </section>
  );
}
