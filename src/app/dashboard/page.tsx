import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dbUser } = await sessionClient
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) redirect('/auth/login')

  const [bookingsRes, visitsRes, savedRes, profileRes] = await Promise.all([
    sessionClient
      .from('counselling_bookings')
      .select('id, status, preferred_date, preferred_time, booking_type, meeting_link')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    sessionClient
      .from('college_visits')
      .select('id, status, visit_date, college_id')
      .eq('student_id', dbUser.id)
      .order('created_at', { ascending: false })
      .limit(5),
    sessionClient
      .from('saved_colleges')
      .select('id, college_id')
      .eq('student_id', dbUser.id),
    sessionClient
      .from('student_profiles')
      .select('full_name, is_complete, desired_course, stream, city, state')
      .eq('user_id', dbUser.id)
      .single(),
  ])

  const bookings = bookingsRes.data ?? []
  const visits = visitsRes.data ?? []
  const savedCount = savedRes.data?.length ?? 0
  const profile = profileRes.data

  const statusConfig: Record<string, { bg: string; dot: string }> = {
    confirmed: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    completed: { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    cancelled: { bg: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
    pending: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">

      {/* ─── Welcome header ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2d6a4f] p-8 sm:p-10">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.04]" />
        <div className="absolute -right-4 top-16 h-24 w-24 rounded-full bg-white/[0.03]" />
        <div className="absolute right-32 -bottom-8 h-32 w-32 rounded-full bg-white/[0.02]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white backdrop-blur-sm border border-white/10">
              {firstName.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-white/50 font-medium">{greeting}</p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                {firstName}
              </h1>
            </div>
          </div>

          {profile?.desired_course && (
            <div className="flex flex-wrap items-center gap-2">
              {profile.desired_course && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 border border-white/10 backdrop-blur-sm">
                  {profile.desired_course}
                </span>
              )}
              {profile.stream && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 border border-white/10 backdrop-blur-sm">
                  {profile.stream}
                </span>
              )}
              {profile.city && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 border border-white/10 backdrop-blur-sm">
                  {profile.city}{profile.state ? `, ${profile.state}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Profile completion banner ─── */}
      {profile && !profile.is_complete && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Your profile is incomplete</p>
            <p className="text-xs text-amber-700/80 mt-0.5">Complete all fields to unlock counselling bookings.</p>
          </div>
          <Link href="/dashboard/settings" className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition-colors">
            Complete
          </Link>
        </div>
      )}

      {/* ─── Stats cards ─── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Bookings', value: bookings.length, href: '/dashboard/bookings', desc: 'Counselling sessions', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', accent: 'from-[#4285F4]/10 to-[#4285F4]/[0.02]', iconBg: 'bg-[#4285F4]/10 text-[#4285F4]' },
          { label: 'Visit Requests', value: visits.length, href: '/dashboard/visits', desc: 'Campus visits', iconPath: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', accent: 'from-[#FF9800]/10 to-[#FF9800]/[0.02]', iconBg: 'bg-[#FF9800]/10 text-[#E65100]' },
          { label: 'Saved Colleges', value: savedCount, href: '/dashboard/saved', desc: 'Your shortlist', iconPath: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', accent: 'from-[#2E7D32]/10 to-[#2E7D32]/[0.02]', iconBg: 'bg-[#2E7D32]/10 text-[#2E7D32]' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5"
          >
            {/* Top accent bar */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{stat.label}</p>
                <p className="mt-2 text-4xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d={stat.iconPath} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Hover arrow */}
            <div className="absolute bottom-5 right-5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Main content grid ─── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">

        {/* Recent Bookings — wider column */}
        <div className="lg:col-span-3 rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <h2 className="text-base font-bold text-foreground">
              Recent Bookings
            </h2>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No bookings yet</p>
              <Link href="/dashboard/bookings" className="mt-2 text-xs font-semibold text-primary hover:underline">
                Book your first session
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {bookings.map((b) => {
                const bStatus = String(b.status ?? 'pending')
                const bType = String(b.booking_type ?? '')
                const bDate = String(b.preferred_date ?? '')
                const bTime = String(b.preferred_time ?? '')
                const bLink = b.meeting_link ? String(b.meeting_link) : null
                const config = statusConfig[bStatus] ?? statusConfig.pending
                return (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30">
                    {/* Date badge */}
                    <div className="hidden sm:flex flex-col items-center justify-center rounded-xl bg-muted/60 px-3 py-2 min-w-[56px]">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground leading-none">
                        {bDate ? new Date(bDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' }) : '—'}
                      </span>
                      <span className="text-lg font-bold text-foreground leading-none mt-0.5">
                        {bDate ? new Date(bDate + 'T00:00:00').getDate() : '—'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {bType === 'free_call' ? 'Free Counselling Call' : bType === 'premium' ? 'Premium Session' : bType}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {bDate} {bTime ? `at ${bTime}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(bStatus === 'confirmed' || bStatus === 'completed') && bLink && (
                        <a href={bLink} target="_blank" rel="noopener noreferrer"
                          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Join
                        </a>
                      )}
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {bStatus.charAt(0).toUpperCase() + bStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Visits */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
              <h2 className="text-base font-bold text-foreground">
                Visit Requests
              </h2>
              <Link href="/dashboard/visits" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                View all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>

            {visits.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">No visits yet</p>
                <Link href="/colleges" className="mt-2 text-xs font-semibold text-primary hover:underline">
                  Explore colleges
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {visits.map((v) => {
                  const vStatus = String(v.status ?? 'pending')
                  const config = statusConfig[vStatus] ?? statusConfig.pending
                  return (
                    <div key={v.id} className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-muted/30">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Campus Visit</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.visit_date}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
            <div className="border-b border-border/40 px-6 py-4">
              <h2 className="text-base font-bold text-foreground">
                Quick Actions
              </h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Explore Colleges', href: '/colleges', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/8' },
                { label: 'Book Session', href: '/dashboard/bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-[#FF9800]', bg: 'bg-[#FF9800]/8' },
                { label: 'Compare', href: '/colleges/compare', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-[#2E7D32]', bg: 'bg-[#2E7D32]/8' },
                { label: 'My Profile', href: '/dashboard/settings', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'text-[#7B1FA2]', bg: 'bg-[#7B1FA2]/8' },
              ].map(action => (
                <Link key={action.label} href={action.href}
                  className="group flex flex-col items-center gap-2 rounded-xl p-4 transition-all hover:bg-muted/50"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} ${action.color} transition-transform group-hover:scale-110`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d={action.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-foreground text-center">{action.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
