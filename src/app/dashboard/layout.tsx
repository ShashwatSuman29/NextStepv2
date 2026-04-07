import Link from 'next/link'
import Image from 'next/image'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileDropdown } from '@/components/layout/profile-dropdown'
import { NotificationBadge } from '@/components/layout/notification-badge'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Use service client for DB reads (bypasses RLS)
  const serviceClient = createServiceClient()

  const { data: dbUser } = await serviceClient
    .from('users')
    .select('id, email, role')
    .eq('auth_id', user.id)
    .single()

  // If admin accidentally lands on /dashboard, redirect to /admin
  if (dbUser?.role === 'admin') redirect('/admin')

  const profileRes = dbUser
    ? await serviceClient
        .from('student_profiles')
        .select('full_name')
        .eq('user_id', dbUser.id)
        .single()
    : { data: null }

  const profile = profileRes.data

  const navLinks = [
    { href: '/colleges', label: 'Colleges' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/visits', label: 'Visits' },
    { href: '/dashboard/saved', label: 'Saved' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  const displayName = profile?.full_name || dbUser?.email?.split('@')[0] || 'User'
  const initials = displayName.charAt(0).toUpperCase()
  const email = dbUser?.email ?? ''

  return (
    <div className="flex min-h-screen flex-col">
      {/* Capsule navbar */}
      <div className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2">
        <header
          className="w-full max-w-5xl rounded-full border border-border/30 px-3 py-1.5 shadow-soft"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0 pl-1 shrink-0 group transition-transform duration-300 hover:scale-[1.02]">
              <Image src="/Nextstep_logo.png" alt="NextStep Logo" width={44} height={44} className="-mr-4 md:-mr-5 h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105" priority />
              <span
                className="text-base md:text-lg font-bold tracking-tight text-foreground"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                NextStep
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side — Notification + Profile */}
            <div className="flex items-center gap-1.5">
              {/* Notification bell — client component for dynamic updates */}
              <NotificationBadge />

              {/* Profile dropdown */}
              <ProfileDropdown
                displayName={displayName}
                email={email}
                initials={initials}
              />
            </div>
          </div>
        </header>
      </div>

      {/* Mobile nav tabs — scrollable */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border/30 bg-card/60 px-4 py-2 md:hidden" style={{ backdropFilter: 'blur(12px)' }}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/dashboard/settings"
          className="flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Settings
        </Link>
      </div>

      <main className="flex-1 bg-muted/50">{children}</main>
    </div>
  )
}
