export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-muted animate-pulse" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="mt-3 h-7 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
