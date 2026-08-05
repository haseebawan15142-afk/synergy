import Link from "next/link";

type ModuleStubProps = {
  title: string;
  description: string;
  phase: number;
};

export function ModuleStub({ title, description, phase }: ModuleStubProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Phase {phase}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          This module is registered in the admin navigation. Full CRUD arrives in Phase {phase}.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
