export default function Loading() {
  return (
    <div className="page-container section-y-tight animate-pulse" aria-hidden>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-2/3 rounded-lg bg-surface-muted" />
        <div className="h-4 w-full rounded bg-surface-muted" />
        <div className="h-4 w-5/6 rounded bg-surface-muted" />
      </div>
    </div>
  );
}
