import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/layout/logout-button'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { href: '/admin/colleges', label: 'Colleges', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/admin/visits', label: 'Visits', icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { href: '/admin/students', label: 'Students', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { href: '/admin/broadcast', label: 'Broadcast', icon: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/auth/login')

  const serviceClient = createServiceClient()
  const { data: dbUser } = await serviceClient
    .from('users')
    .select('id, role, email')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.role !== 'admin') redirect('/dashboard')

  const adminName = dbUser.email?.split('@')[0] ?? 'Admin'
  const adminInitial = adminName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-card md:flex">
        <div className="flex h-14 items-center border-b border-border/60 px-5">
          <Link href="/admin" className="flex items-center gap-0 group">
            <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-ml-2 -mr-5 h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                NextStep
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Navigation</p>
          {sidebarLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0 transition-colors group-hover:text-primary">
                <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-accent/40 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[10px] font-bold text-white">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{adminName}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile capsule header */}
        <div className="sticky top-0 z-50 flex justify-center px-3 pt-2.5 pb-1.5 bg-muted/50 md:hidden">
          <header
            className="w-full rounded-full border border-border/30 px-3 py-1.5 shadow-soft"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-0 pl-1 shrink-0">
                <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-mr-3 h-9 w-auto object-contain" />
                <span className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>NextStep</span>
                <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider">Admin</span>
              </Link>
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[10px] font-bold text-white">
                  {adminInitial}
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>
        </div>

        {/* Mobile nav tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border/30 bg-card/60 px-3 py-2 md:hidden" style={{ backdropFilter: 'blur(12px)' }}>
          {sidebarLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 bg-muted/50 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
