import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions | NextStep',
}

export default function TermsConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="transparent" />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#95d5b2]/20 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-28 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Terms &amp; Conditions
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
              {['Acceptance of Terms', 'Acceptable Use', 'College Disclaimer', 'Counselling & Visits', 'Account Responsibilities', 'Intellectual Property', 'Contact'].map((item, i) => (
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
                <h2 className="text-lg font-semibold text-foreground">Acceptance of Terms</h2>
              </div>
              <p>By accessing or using the NextStep platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-2" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">2</span>
                <h2 className="text-lg font-semibold text-foreground">Acceptable Use</h2>
              </div>
              <p>You agree to use NextStep only for lawful purposes. You must not use our platform in any way that causes, or may cause, damage to the website or impairment of its availability or accessibility.</p>
              <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/[0.03] p-4">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Attempting to bypass the platform&apos;s payment architecture is strictly prohibited.
                </p>
              </div>
            </section>

            <hr className="border-border/40" />

            <section id="section-3" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">3</span>
                <h2 className="text-lg font-semibold text-foreground">College Information Disclaimer</h2>
              </div>
              <p>While we strive to keep our college directory (including fees, placements, and accreditation) accurate and up-to-date, college policies and fee structures are subject to change by the respective institutions.</p>
              <p className="mt-3">NextStep is not legally liable for discrepancies between our database and a college&apos;s official data. Always verify critical information directly with the institution.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-4" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">4</span>
                <h2 className="text-lg font-semibold text-foreground">Counselling &amp; Visits</h2>
              </div>
              <p>Counselling slots and campus visits are subject to availability. Abuse of our booking systems, including scheduling visits without intention to attend, may result in permanent suspension of your account.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-5" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">5</span>
                <h2 className="text-lg font-semibold text-foreground">User Account Responsibilities</h2>
              </div>
              <p>You are responsible for safeguarding the password used to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorised use of your account.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-6" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">6</span>
                <h2 className="text-lg font-semibold text-foreground">Intellectual Property</h2>
              </div>
              <p>The Service and its original content, features, and functionality are and will remain the exclusive property of NextStep and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-7" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">7</span>
                <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              </div>
              <p>For questions about these terms, contact us at{' '}
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
