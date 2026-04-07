export default function CollegesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b border-border/40 bg-card" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-16">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-muted animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="h-48 w-full bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
