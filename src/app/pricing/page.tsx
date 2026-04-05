import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FAQSection } from '@/components/shared/faq-section'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Pricing | NextStep',
  description: 'Transparent pricing for premium college discovery and counselling services.',
}

export default async function PricingPage() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('counselling_price_inr, visit_price_inr')
    .single()

  const counsellingPrice = data?.counselling_price_inr || 199
  const visitPrice = data?.visit_price_inr || 499

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <main className="pb-24 pt-32 sm:pt-40">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl" style={{ fontFamily: 'var(--font-serif)' }}>
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Unlock premium features and personal guidance to secure your ideal college admission. No hidden fees.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl px-5">
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Counselling Plan */}
            <div className="relative flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lifted">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>1-on-1 Counselling</h3>
                <p className="mt-2 text-sm text-muted-foreground">Expert guidance tailored specifically to your career goals and college preferences.</p>
              </div>
              
              <div className="mb-6 flex flex-col border-b border-border/50 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">₹{counsellingPrice}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/ session</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-primary uppercase tracking-wider">3 Free sessions included!</p>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {[
                  'Personalized career roadmap',
                  'College shortlisting & comparison',
                  'Admission application assistance',
                  'Direct chat mapping with expert',
                  'Doubt clearing strategy'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard/bookings"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
              >
                Book a Session
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            {/* Premium Visit Plan */}
            <div className="relative flex flex-col rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent p-8 shadow-lifted ring-1 ring-primary/10 transition-all hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-primary-dark px-4 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Premium College Visit</h3>
                <p className="mt-2 text-sm text-muted-foreground">Skip the queue and secure an exclusive, closely-guided campus tour at top universities.</p>
              </div>
              
              <div className="mb-6 flex flex-col border-b border-border/50 pb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">₹{visitPrice}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/ Campus Visit</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-primary uppercase tracking-wider">1 Free visit included!</p>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {[
                  'Priority booking approval',
                  'Dedicated campus tour guide',
                  'Access to premium campus areas',
                  'Direct faculty interaction (if available)',
                  'Lunch / Refreshments included'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/colleges"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-foreground to-foreground/80 px-6 py-3.5 text-sm font-bold text-background shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              >
                Explore Colleges to Visit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          title="Pricing FAQ"
          subtitle="Everything you need to know about our pricing and credits."
          items={[
            { question: 'When do I have to pay?', answer: 'Your first few counselling sessions and your first college visit are completely free! You only ever hit a paywall once you have exhausted your generous free limits.' },
            { question: 'Are there any hidden charges?', answer: 'Absolutely not. The price you see here is exactly what you pay per added session or visit. No surprise fees, no subscriptions.' },
            { question: 'Do these credits expire?', answer: 'No, once you purchase extra counselling or visit credits in your dashboard, they remain in your wallet indefinitely until used.' },
            { question: 'Can I get a refund?', answer: 'Yes! If you are unsatisfied with a counselling session or a visit experience, you can request a refund within 7 days of the service. Check our refund policy for more details.' },
            { question: 'How do I book a session or visit?', answer: 'Simply sign up, browse colleges, and click "Book Counselling" or "Request Visit" on any college page. Your free credits will be applied automatically.' },
          ]}
          className="mt-12"
        />
      </main>

      <Footer />
    </div>
  )
}
