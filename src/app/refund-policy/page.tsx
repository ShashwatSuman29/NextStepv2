import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy | NextStep',
}

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#74c69d]/20 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/80">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Refund Policy
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
              {['General Policy', 'Counselling Sessions', 'Campus Visits', 'Service Disruptions', 'Processing Time'].map((item, i) => (
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
                <h2 className="text-lg font-semibold text-foreground">General Policy</h2>
              </div>
              <p>At NextStep, our goal is to provide exceptional guidance. Because our premium counselling sessions and guided campus visits require advance coordination with experts and institutions, we enforce a strict but fair refund policy.</p>
              <p className="mt-3">Refunds are generally not provided once a booking is confirmed, except in cases of platform error or provider cancellation.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-2" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">2</span>
                <h2 className="text-lg font-semibold text-foreground">Premium Counselling Sessions</h2>
              </div>
              {/* Refund tiers */}
              <div className="mt-2 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-[#2E7D32]/15 bg-[#2E7D32]/[0.04] p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/15 text-[#2E7D32]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">100% Refund</p>
                    <p className="text-sm mt-0.5">Cancel at least 48 hours before the scheduled session.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-[#FF9800]/15 bg-[#FF9800]/[0.04] p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF9800]/15 text-[#E65100]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">50% Refund</p>
                    <p className="text-sm mt-0.5">Cancel between 24 and 48 hours before the scheduled session.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">No Refund</p>
                    <p className="text-sm mt-0.5">Cancellations less than 24 hours prior, or no-shows.</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border/40" />

            <section id="section-3" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">3</span>
                <h2 className="text-lg font-semibold text-foreground">Paid Campus Visits</h2>
              </div>
              <p>If you have paid for a guided premium campus tour, full refunds are only issued if the cancellation is made at least <strong className="text-foreground">3 days (72 hours)</strong> in advance. Institutional gate passes are non-transferable and often non-refundable closer to the date.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-4" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">4</span>
                <h2 className="text-lg font-semibold text-foreground">Service Disruptions</h2>
              </div>
              <p>If NextStep or the destination college cancels a scheduled visit or counselling session due to unforeseen circumstances, you are entitled to a <strong className="text-foreground">100% full refund</strong> or a free rescheduling of the event, based on your preference.</p>
            </section>

            <hr className="border-border/40" />

            <section id="section-5" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary text-xs font-bold">5</span>
                <h2 className="text-lg font-semibold text-foreground">Processing Time</h2>
              </div>
              <p>Approved refunds will be processed back to the original payment method within <strong className="text-foreground">5-7 business days</strong> depending on your banking institution.</p>
              <p className="mt-3">For refund queries, reach out to{' '}
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
