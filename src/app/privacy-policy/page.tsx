import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | NextStep',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="transparent" />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#95d5b2]/20 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-28 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/40">Last updated: March 2026</p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-6 py-12 flex-1">
        <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
          {/* Sidebar TOC */}
          <nav className="hidden lg:block sticky top-24 self-start">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">On this page</p>
            <ul className="space-y-2 border-l border-border/50 pl-4">
              {['Information We Collect', 'How We Use It', 'Information Sharing', 'Data Security', 'Cookies', 'Contact Us'].map((item, i) => (
                <li key={item}>
                  <a href={`#section-${i + 1}`} className="text-[13px] text-muted-foreground hover:text-primary transition-colors leading-snug block py-0.5">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="space-y-10 text-[15px] leading-relaxed text-muted-foreground">
            <section id="section-1" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">1</span>
                <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
              </div>
              <p>NextStep (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects personal information when you register on our platform, book a counselling session, or schedule a college visit. This includes:</p>
              <ul className="mt-3 space-y-2 pl-1">
                {['Full name, email address, and phone number', 'Academic history (10th, 12th marks, entrance exam scores)', 'Preferred courses, branches, and target colleges', 'City, state, and budget preferences'].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-primary/60"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-border/40" />

            <section id="section-2" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">2</span>
                <h2 className="text-lg font-semibold text-foreground">How We Use Your Information</h2>
              </div>
              <p>We use the information we collect to:</p>
              <ul className="mt-3 space-y-2 pl-1">
                {['Provide personalised college recommendations and admission guidance', 'Facilitate campus visits and share schedules with partner institutions', 'Schedule and manage your counselling sessions with our experts', 'Communicate updates, new colleges, and platform changes'].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-primary/60"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="border-border/40" />

            <section id="section-3" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">3</span>
                <h2 className="text-lg font-semibold text-foreground">Information Sharing</h2>
              </div>
              <p>We do not sell your personal data. We only share necessary information with our partner colleges when you explicitly request a campus visit or express interest in their programs, strictly for the purpose of facilitating your admission journey.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-4" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">4</span>
                <h2 className="text-lg font-semibold text-foreground">Data Security</h2>
              </div>
              <p>We implement industry-standard security measures including strict Database Row-Level Security (RLS) to protect your personal data from unauthorised access, alteration, or disclosure. All data is encrypted in transit and at rest.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-5" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">5</span>
                <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
              </div>
              <p>We use cookies to enhance your experience. By using NextStep, you consent to our use of cookies in accordance with this Privacy Policy. Cookies help us understand usage patterns and improve our platform.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-6" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">6</span>
                <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
              </div>
              <p>If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:hello.yournextstep@gmail.com" className="text-primary font-medium hover:underline">hello.yournextstep@gmail.com</a>.
              </p>
            </section>

            {/* Back link */}
            <div className="pt-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
