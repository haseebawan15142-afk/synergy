import { cn } from "@/lib/cn";

export function AdminSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800", className)} />;
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <AdminSkeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminSkeleton key={i} className="h-28" />
        ))}
      </div>
      <AdminSkeleton className="h-64 w-full" />
    </div>
  );
}
