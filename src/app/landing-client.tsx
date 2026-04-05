'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection } from '@/components/shared/animated-section'
import { StatCounter } from '@/components/shared/stat-counter'
import { TestimonialCarousel } from '@/components/shared/testimonial-carousel'
import { CollegeCard } from '@/components/shared/college-card'
import { FAQSection } from '@/components/shared/faq-section'
import { createClient } from '@/lib/supabase/client'

interface FeaturedCollege {
  id: string
  name: string
  city: string
  state: string
  image_paths: string[]
  fee_min: number | null
  fee_max: number | null
  description: string | null
  placement_rate: number | null
  college_type: string | null
  established_year: number | null
  accreditation: string | null
  hostel_available: boolean
  scholarship: boolean
}

export function LandingClient({ colleges }: { colleges: FeaturedCollege[] }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
  }, [])

  const ctaHref = isLoggedIn ? '/dashboard' : '/auth/login'

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="solid" />

      {/* ============ HERO — Full-bleed image with text overlay ============ */}
      <section className="relative -mt-16 flex min-h-[92vh] items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
          }}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-16">
          <h1
            className="text-3xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-[4.5rem] tracking-tight drop-shadow-lg"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Your College Journey,<br />Simplified
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-lg text-sm text-white/75 sm:text-lg uppercase tracking-[0.15em] font-medium drop-shadow-sm">
            Admissions, Counselling &amp; Campus Visits
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-[15px] font-bold uppercase tracking-wider text-primary-dark transition-all duration-300 hover:bg-transparent hover:text-white hover:shadow-lg"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </Link>
            <Link
              href="/colleges"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/60 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-[15px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-primary-dark hover:shadow-lg"
            >
              Browse Colleges
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => document.getElementById('featured-colleges')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">Scroll to explore</span>
          <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1 group-hover:border-white/60 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ============ FEATURED COLLEGES ============ */}
      {colleges.length > 0 && (
        <section id="featured-colleges" className="relative border-t border-border/40 py-16 sm:py-24 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <AnimatedSection className="flex flex-col items-center justify-between gap-5 sm:flex-row">
              <div className="text-center sm:text-left">
                <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  Featured
                </span>
                <h2 className="mt-5 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  Top colleges on NextStep
                </h2>
              </div>
              <Link
                href="/colleges"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-all hover:shadow-lifted hover:border-primary/20 hover:-translate-y-0.5"
              >
                View all colleges
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary">
                  <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </AnimatedSection>

            <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {colleges.map((college, i) => (
                <CollegeCard
                  key={college.id}
                  id={college.id}
                  name={college.name}
                  city={college.city}
                  state={college.state}
                  feeMin={college.fee_min}
                  feeMax={college.fee_max}
                  description={college.description}
                  placementRate={college.placement_rate}
                  collegeType={college.college_type}
                  imagePaths={college.image_paths}
                  establishedYear={college.established_year}
                  accreditation={college.accreditation}
                  hostelAvailable={college.hostel_available}
                  scholarship={college.scholarship}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ WHY NEXTSTEP — Alternating rows with illustrations ============ */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-border/30 overflow-hidden">
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection className="text-center mb-12 sm:mb-20">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Why NextStep
            </span>
            <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl lg:text-[2.75rem] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Everything you need for your<br className="hidden sm:block" /> admission journey
            </h2>
          </AnimatedSection>

          {/* Feature 1 — Discover */}
          <AnimatedSection className="grid items-center gap-8 md:grid-cols-2 lg:gap-16 mb-16 sm:mb-24">
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-[#E8F0FE] -rotate-3 scale-[1.02]" />
                <div className="relative rounded-3xl bg-[#E8F0FE] p-8 flex items-center justify-center">
                  <svg viewBox="0 0 280 200" fill="none" className="w-full">
                    {/* Magnifying glass */}
                    <circle cx="120" cy="90" r="45" stroke="#4285F4" strokeWidth="6" fill="#E8F0FE"/>
                    <line x1="153" y1="123" x2="185" y2="155" stroke="#4285F4" strokeWidth="8" strokeLinecap="round"/>
                    {/* College building inside lens */}
                    <rect x="100" y="80" width="40" height="25" rx="2" fill="#4285F4" opacity="0.3"/>
                    <rect x="108" y="68" width="24" height="12" rx="1" fill="#4285F4" opacity="0.4"/>
                    <path d="M120 60 L132 68 H108 Z" fill="#4285F4" opacity="0.5"/>
                    {/* Windows */}
                    <rect x="107" y="86" width="6" height="6" rx="1" fill="#4285F4" opacity="0.6"/>
                    <rect x="117" y="86" width="6" height="6" rx="1" fill="#4285F4" opacity="0.6"/>
                    <rect x="127" y="86" width="6" height="6" rx="1" fill="#4285F4" opacity="0.6"/>
                    {/* Floating cards */}
                    <rect x="185" y="40" width="70" height="22" rx="6" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
                    <circle cx="197" cy="51" r="5" fill="#34A853"/>
                    <rect x="207" y="47" width="38" height="3" rx="1.5" fill="#E0E0E0"/>
                    <rect x="207" y="53" width="24" height="2" rx="1" fill="#F0F0F0"/>
                    <rect x="185" y="68" width="70" height="22" rx="6" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
                    <circle cx="197" cy="79" r="5" fill="#FBBC04"/>
                    <rect x="207" y="75" width="38" height="3" rx="1.5" fill="#E0E0E0"/>
                    <rect x="207" y="81" width="24" height="2" rx="1" fill="#F0F0F0"/>
                    {/* Check marks */}
                    <circle cx="50" cy="50" r="14" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <path d="M44 50 L48 54 L56 46" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="60" cy="155" r="11" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <path d="M55 155 L58 158 L65 151" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#4285F4]/10 px-3 py-1 text-[13px] font-semibold text-[#4285F4] mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Discover
              </div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                Find colleges that match your goals
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
                Filter by course, location, fees, and eligibility. Compare colleges side by side to find your best fit.
              </p>
              <ul className="mt-6 space-y-3">
                {['Side-by-side comparison', 'Detailed fee & placement data', 'Save your shortlist'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-foreground/80">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4]/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Feature 2 — Counselling (reversed) */}
          <AnimatedSection className="grid items-center gap-8 md:grid-cols-2 lg:gap-16 mb-16 sm:mb-24">
            <div className="md:order-2 relative flex items-center justify-center">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-[#FFF3E0] rotate-2 scale-[1.02]" />
                <div className="relative rounded-3xl bg-[#FFF3E0] p-8 flex items-center justify-center">
                  <svg viewBox="0 0 280 200" fill="none" className="w-full">
                    {/* Video call frame */}
                    <rect x="50" y="30" width="180" height="120" rx="12" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"/>
                    <rect x="50" y="30" width="180" height="120" rx="12" stroke="#FF9800" strokeWidth="2" opacity="0.3"/>
                    {/* Person 1 — counsellor */}
                    <rect x="58" y="38" width="82" height="66" rx="6" fill="#FFF8E1"/>
                    <circle cx="99" cy="60" r="12" fill="#FFB74D"/>
                    <path d="M82 88 C82 78, 99 72, 99 72 C99 72, 116 78, 116 88" fill="#FF9800" opacity="0.4"/>
                    <rect x="85" y="108" width="28" height="6" rx="3" fill="#E0E0E0"/>
                    {/* Person 2 — student */}
                    <rect x="148" y="38" width="74" height="66" rx="6" fill="#FFF8E1"/>
                    <circle cx="185" cy="60" r="12" fill="#8D6E63"/>
                    <path d="M170 88 C170 78, 185 72, 185 72 C185 72, 200 78, 200 88" fill="#A1887F" opacity="0.4"/>
                    {/* Calendar icon */}
                    <rect x="30" y="130" width="50" height="44" rx="8" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <rect x="30" y="130" width="50" height="14" rx="8" fill="#FF9800" opacity="0.2"/>
                    <rect x="38" y="150" width="8" height="6" rx="1" fill="#FF9800" opacity="0.3"/>
                    <rect x="50" y="150" width="8" height="6" rx="1" fill="#FF9800" opacity="0.3"/>
                    <rect x="62" y="150" width="8" height="6" rx="1" fill="#FF9800" opacity="0.6"/>
                    <rect x="38" y="160" width="8" height="6" rx="1" fill="#FF9800" opacity="0.3"/>
                    <rect x="50" y="160" width="8" height="6" rx="1" fill="#FF9800" opacity="0.3"/>
                    {/* Chat bubble */}
                    <rect x="200" y="125" width="65" height="32" rx="8" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <rect x="210" y="134" width="36" height="3" rx="1.5" fill="#FFB74D"/>
                    <rect x="210" y="141" width="24" height="3" rx="1.5" fill="#FFE0B2"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9800]/10 px-3 py-1 text-[13px] font-semibold text-[#E65100] mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Counselling
              </div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                Talk to experts who get it
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
                Book one-on-one sessions with verified counsellors who understand Indian admissions inside out.
              </p>
              <ul className="mt-6 space-y-3">
                {['Verified admission counsellors', 'Personalised college shortlist', 'JEE & entrance guidance'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-foreground/80">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF9800]/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#E65100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Feature 3 — Campus Visits */}
          <AnimatedSection className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="absolute inset-0 rounded-3xl bg-[#E8F5E9] -rotate-2 scale-[1.02]" />
                <div className="relative rounded-3xl bg-[#E8F5E9] p-8 flex items-center justify-center">
                  <svg viewBox="0 0 280 200" fill="none" className="w-full">
                    {/* Map background */}
                    <rect x="30" y="20" width="220" height="160" rx="12" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))"/>
                    {/* Road lines */}
                    <line x1="30" y1="100" x2="250" y2="100" stroke="#E8F5E9" strokeWidth="20"/>
                    <line x1="140" y1="20" x2="140" y2="180" stroke="#E8F5E9" strokeWidth="16"/>
                    <path d="M60 60 Q140 40 220 70" stroke="#C8E6C9" strokeWidth="10" fill="none"/>
                    {/* Location pins */}
                    <g transform="translate(90, 55)">
                      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#2E7D32"/>
                      <circle cx="12" cy="12" r="5" fill="white"/>
                    </g>
                    <g transform="translate(170, 85)">
                      <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 16 10 16s10-8.5 10-16c0-5.5-4.5-10-10-10z" fill="#66BB6A"/>
                      <circle cx="10" cy="10" r="4" fill="white"/>
                    </g>
                    <g transform="translate(60, 115)">
                      <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 16 10 16s10-8.5 10-16c0-5.5-4.5-10-10-10z" fill="#81C784"/>
                      <circle cx="10" cy="10" r="4" fill="white"/>
                    </g>
                    {/* Ticket card */}
                    <rect x="175" y="130" width="80" height="40" rx="8" fill="white" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
                    <rect x="183" y="138" width="30" height="3" rx="1.5" fill="#2E7D32" opacity="0.6"/>
                    <rect x="183" y="145" width="50" height="2" rx="1" fill="#E0E0E0"/>
                    <rect x="183" y="151" width="40" height="2" rx="1" fill="#E0E0E0"/>
                    <rect x="239" y="157" width="10" height="10" rx="2" fill="#2E7D32" opacity="0.2"/>
                    <path d="M242 161 L244 163 L248 159" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32]/10 px-3 py-1 text-[13px] font-semibold text-[#2E7D32] mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                Campus Visits
              </div>
              <h3 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                See it before you commit
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
                Request campus visits and we coordinate the schedule. Experience the college first-hand before deciding.
              </p>
              <ul className="mt-6 space-y-3">
                {['Coordinated by NextStep team', 'Visit multiple colleges in one trip', 'Free for registered students'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-[15px] text-foreground/80">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2E7D32]/10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ STATS — compact banner ============ */}
      <section className="relative overflow-hidden bg-primary-dark py-12 sm:py-16 px-4 sm:px-6">
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#6a9b8e]/25 blur-[120px]" />
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-[#50786d]/18 blur-[120px]" />
        <div className="relative mx-auto grid max-w-4xl gap-6 grid-cols-2 lg:grid-cols-4">
          <StatCounter end={20} suffix="+" label="Partner Colleges" />
          <StatCounter end={100} suffix="+" label="Students Guided" />
          <StatCounter end={50} suffix="+" label="Counselling Sessions" />
          <StatCounter end={95} suffix="%" label="Satisfaction Rate" />
        </div>
      </section>

      {/* ============ HOW IT WORKS — Vertical timeline ============ */}
      <section className="relative py-16 sm:py-28 px-4 sm:px-6 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

        <div className="relative mx-auto max-w-3xl">
          <AnimatedSection className="text-center mb-12 sm:mb-20">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              How It Works
            </span>
            <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl lg:text-[2.75rem] tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Three steps to your dream college
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-muted-foreground leading-relaxed">
              Getting started is simple. Here&apos;s how NextStep helps you find, compare, and visit your ideal college.
            </p>
          </AnimatedSection>

          {/* Timeline steps */}
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />

            {[
              {
                num: '01',
                title: 'Create your profile',
                desc: 'Sign up and share your academics, preferences, and budget. Takes under 2 minutes.',
                detail: 'Our smart onboarding captures everything colleges need — 10th & 12th marks, entrance scores, budget range, and preferred location.',
                icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              },
              {
                num: '02',
                title: 'Explore & compare',
                desc: 'Browse colleges with smart filters, compare fees and placements side-by-side, and save your shortlist.',
                detail: 'Filter by course, location, fees, and rankings. Pin your top picks and compare them in a detailed head-to-head view.',
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
              },
              {
                num: '03',
                title: 'Book & visit',
                desc: 'Schedule a free counselling call or request a campus visit. We coordinate everything for you.',
                detail: 'Pick a date, get a confirmed video call with an expert, or let us arrange a campus tour — zero coordination hassle on your end.',
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.num} delay={i * 0.15}>
                <div className="relative flex gap-6 sm:gap-10 mb-16 last:mb-0 group">
                  {/* Step indicator */}
                  <div className="relative z-10 flex flex-col items-center shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/60">{`Step ${item.num}`}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA below timeline */}
          <AnimatedSection delay={0.5} className="mt-16 text-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started Now'}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative border-t border-border/40 py-16 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <AnimatedSection className="text-center">
            <span className="inline-block rounded-full border border-primary/15 bg-primary/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Student Stories
            </span>
            <h2 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Hear from students who<br className="hidden sm:block" /> found their path
            </h2>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.2} className="relative mt-14">
          <TestimonialCarousel />
        </AnimatedSection>
      </section>

      {/* ============ FAQ ============ */}
      <FAQSection
        title="Got questions?"
        subtitle="Everything you need to know about NextStep."
        items={[
          { question: 'Is NextStep free to use?', answer: 'Yes! You get free counselling sessions and a free campus visit to get started. Premium features are available at affordable prices if you need more.' },
          { question: 'How do I book a counselling session?', answer: 'Simply create your profile, go to the Bookings page, pick a date and time slot, and confirm. Our counsellors will connect with you via a video call.' },
          { question: 'Which colleges are listed on NextStep?', answer: 'We partner with 20+ colleges across India including engineering, pharmacy, law, management, and education institutes. New colleges are added regularly.' },
          { question: 'Can I visit a college campus through NextStep?', answer: 'Absolutely. You can request a campus visit for any listed college. We coordinate with the college and confirm your visit date — no running around needed.' },
          { question: 'Is my personal data safe?', answer: 'Yes. We use industry-standard encryption and never share your data with third parties without your consent. Read our Privacy Policy for full details.' },
        ]}
        className="border-t border-border/40"
      />

      {/* ============ CTA — Stripe-style final section ============ */}
      <section className="relative overflow-hidden py-16 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-primary-dark" />

        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#6a9b8e]/25 blur-[120px]" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#50786d]/15 blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-[#50786d]/10 blur-[100px]" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <AnimatedSection variant="scaleIn" className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            Ready to take the<br /> next step?
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/45 leading-relaxed">
            Join thousands of students who are already navigating their college journey with confidence.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3.5 sm:py-4 text-sm sm:text-[15px] font-semibold text-primary-dark shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Start your journey'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3.333 8h9.334M8.667 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/colleges"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3.5 sm:py-4 text-sm sm:text-[15px] font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/25 hover:text-white"
            >
              Explore colleges
            </Link>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  )
}
