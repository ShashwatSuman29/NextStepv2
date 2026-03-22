import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/auth/login')

  const supabase = createServiceClient()

  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) redirect('/auth/login')

  const [bookingsRes, visitsRes, savedRes, profileRes] = await Promise.all([
    supabase
      .from('counselling_bookings')
      .select('id, status, preferred_date, preferred_time, booking_type')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('college_visits')
      .select('id, status, visit_date, college_id')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('saved_colleges')
      .select('id, college_id')
      .eq('student_id', dbUser.id),
    supabase
      .from('student_profiles')
      .select('full_name, is_complete')
      .eq('user_id', dbUser.id)
      .single(),
  ])

  const bookings = bookingsRes.data ?? []
  const visits = visitsRes.data ?? []
  const savedCount = savedRes.data?.length ?? 0
  const profile = profileRes.data

  const statusStyles: Record<string, string> = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  const stats = [
    {
      label: 'Bookings',
      value: bookings.length,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-primary-light text-primary',
      href: '/dashboard/bookings',
    },
    {
      label: 'Visit Requests',
      value: visits.length,
      icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      color: 'bg-surface-warm text-amber-700',
      href: '/dashboard/visits',
    },
    {
      label: 'Saved Colleges',
      value: savedCount,
      icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
      color: 'bg-green-50 text-green-700',
      href: '/dashboard/saved',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Welcome back, {profile?.full_name ?? 'Student'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                  {stat.value}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d={stat.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Recent Bookings
            </h2>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>
          {bookings.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No bookings yet.</p>
              <Link href="/colleges" className="mt-2 text-xs font-semibold text-primary hover:underline">
                Browse colleges to book
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:bg-muted/60">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {b.booking_type === 'free_call' ? 'Free Counselling Call' : b.booking_type}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {b.preferred_date} at {b.preferred_time}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[b.status] ?? statusStyles.pending}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visits */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
              Recent Visit Requests
            </h2>
          </div>
          {visits.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">No visit requests yet.</p>
              <Link href="/colleges" className="mt-2 text-xs font-semibold text-primary hover:underline">
                Explore colleges to visit
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {visits.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:bg-muted/60">
                  <div>
                    <p className="text-sm font-semibold text-foreground">College Visit</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{v.visit_date}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
