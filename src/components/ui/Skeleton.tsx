import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200/70", className)} />;
}

/** Placeholder for a page while its data loads. */
export function PageSkeleton({ header = true }: { header?: boolean }) {
  return (
    <div role="status" aria-label="Loading">
      {header && (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="mt-6 h-64" />
    </div>
  );
}

/** Placeholder for the whole dashboard (sidebar + page) while the account loads. */
export function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 shrink-0 space-y-6 border-r border-slate-200 bg-white p-4 lg:block">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-14" />
        <div className="space-y-2">
          {Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="h-9" />)}
        </div>
      </div>
      <div className="flex-1">
        <div className="h-16 border-b border-slate-200 bg-white" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <PageSkeleton />
        </div>
      </div>
    </div>
  );
}
