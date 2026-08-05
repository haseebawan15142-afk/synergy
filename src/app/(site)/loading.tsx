/** Slim top bar instead of a full-page skeleton (feels snappier on navigation). */
export default function Loading() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-transparent"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-pulse bg-synergy" />
    </div>
  );
}
