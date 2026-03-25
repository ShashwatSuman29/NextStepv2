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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Link href="/admin" className="flex items-center gap-0 group">
            <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-ml-2 -mr-5 md:-mr-6 h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
                NextStep
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Navigation</p>
          {sidebarLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 transition-colors group-hover:text-primary">
                <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-accent/40 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-xs font-bold text-white shadow-sm">
              {adminName.charAt(0).toUpperCase()}
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
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card px-5 md:hidden">
          <Link href="/admin" className="flex items-center gap-0">
            <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-ml-2 -mr-3 md:-mr-4 h-10 md:h-12 w-auto object-contain" />
            <span className="text-sm font-bold text-foreground">NextStep</span>
            <span className="mt-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">Admin</span>
          </Link>
          <LogoutButton />
        </header>
        {/* Mobile nav */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border/40 bg-card px-5 py-2 md:hidden">
          {sidebarLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
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
