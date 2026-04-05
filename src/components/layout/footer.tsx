import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-card">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand — 2 cols */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-0">
              <img src="/Nextstep_logo.png" alt="NextStep Logo" className="-ml-2 -mr-5 md:-mr-6 h-14 md:h-16 w-auto object-contain" />
              <span
                className="text-lg md:text-xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                NextStep
              </span>
            </div>
            <p className="mt-4 hidden md:block max-w-xs text-sm leading-relaxed text-muted-foreground">
              Helping Indian students navigate college admissions with structured guidance,
              expert counselling, and organized campus visits.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { name: 'instagram', href: 'https://instagram.com/yournextstep' },
                { name: 'whatsapp', href: 'https://wa.me/917029139659' }
              ].map(social => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:border-primary/20 hover:text-primary hover:shadow-soft cursor-pointer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    {social.name === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></>}
                    {social.name === 'whatsapp' && <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden md:block">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-sans)' }}>
              Explore
            </h4>
            <ul className="mt-5 space-y-3.5">
              {[
                { href: '/colleges', label: 'Browse Colleges' },
                { href: '/colleges/compare', label: 'Compare Colleges' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="hidden md:block">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-sans)' }}>
              For Students
            </h4>
            <ul className="mt-5 space-y-3.5">
              {[
                { href: '/dashboard/bookings', label: 'Book Counselling', key: 'counselling' },
                { href: '/dashboard/visits', label: 'Schedule Visit', key: 'visit' },
                { href: '/dashboard', label: 'Track Applications', key: 'track' },
              ].map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                style={{ fontFamily: 'var(--font-sans)' }}>
              Contact
            </h4>
            <ul className="mt-5 space-y-3.5">
              <li>
                <a href="mailto:hello.yournextstep@gmail.com" className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-muted-foreground/60"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  hello.yournextstep@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-muted-foreground/60"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} NextStep. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy-policy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/refund-policy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
