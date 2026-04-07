export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner skeleton */}
      <div className="bg-primary-dark">
        <div className="h-16" />
        <div className="mx-auto max-w-5xl py-12 sm:py-20 px-4 sm:px-5">
          <div className="h-4 w-32 rounded bg-white/10 animate-pulse mb-6" />
          <div className="h-9 w-3/4 rounded-lg bg-white/10 animate-pulse" />
          <div className="mt-4 flex flex-wrap gap-2.5">
            <div className="h-6 w-28 rounded-full bg-white/10 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-5xl px-4 sm:px-5 py-8 space-y-6">
        {/* Photo gallery skeleton */}
        <div className="h-72 sm:h-96 rounded-2xl bg-muted animate-pulse" />

        {/* About section skeleton */}
        <div className="rounded-2xl border border-border/60 bg-card p-7 space-y-4">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* Courses skeleton */}
        <div className="rounded-2xl border border-border/60 bg-card p-7 space-y-4">
          <div className="h-5 w-36 rounded bg-muted animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
