'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection } from '@/components/shared/animated-section'
import { SaveToggle } from '@/components/shared/save-toggle'
import { FAQSection } from '@/components/shared/faq-section'
import type { College, CollegeCourse } from '@/types'

export function CollegeDetailClient({
  college: c,
  courses: courseList,
}: {
  college: College
  courses: CollegeCourse[]
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
  }, [])

  const hasPhotos = c.image_paths && c.image_paths.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-primary-dark">
        <Navbar />

      {/* Hero banner with photo */}
      <section className="relative overflow-hidden bg-primary-dark">
        {hasPhotos && (
          <div className="absolute inset-0">
            <img src={c.image_paths[0]} alt={`${c.name} campus`} className="h-full w-full object-cover opacity-25"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/85 to-primary-dark/50" />
          </div>
        )}
        {!hasPhotos && (
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
            }}
          />
        )}
        <div className="relative mx-auto max-w-5xl py-12 sm:py-20 px-4 sm:px-5">
          <AnimatedSection>
            <Link href="/colleges" className="group inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/15 transition-all mb-6">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:-translate-x-0.5">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to colleges
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl tracking-tight leading-tight">{c.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                    </svg>
                    {c.city}, {c.state}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  {c.college_type && (
                    <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90 capitalize">{c.college_type}</span>
                  )}
                  {c.established_year && (
                    <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/90">Est. {c.established_year}</span>
                  )}
                  {c.accreditation && (
                    <span className="rounded-full bg-amber-400/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/20">{c.accreditation}</span>
                  )}
                </div>
              </div>
              <SaveToggle collegeId={c.id} className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10 transition-all hover:scale-105" size={20} />
            </div>

            {/* Quick stats bar */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
              {c.placement_rate != null && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 14l4-4 3 3 5-7" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{c.placement_rate}%</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Placement</p>
                  </div>
                </div>
              )}
              {c.avg_package != null && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/15">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4H6.5a2.5 2.5 0 000 5H9a2.5 2.5 0 010 5H5M8 2v12" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">₹{c.avg_package?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Avg Package (LPA)</p>
                  </div>
                </div>
              )}
              {(c.fee_min || c.fee_max) && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-400/15">
                    <span className="text-base font-bold text-purple-400">₹</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-lg font-bold text-white truncate">₹{c.fee_min?.toLocaleString('en-IN') ?? '—'} – ₹{c.fee_max?.toLocaleString('en-IN') ?? '—'}</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Fee Range / Year</p>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 py-8">
        {/* Photo Gallery */}
        {hasPhotos && c.image_paths.length > 1 && (
          <AnimatedSection className="mb-6">
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Campus Gallery
                </h3>
                <span className="text-xs text-muted-foreground">{activePhotoIndex + 1} / {c.image_paths.length}</span>
              </div>
              <div className="relative rounded-xl overflow-hidden h-72 sm:h-96 bg-muted group">
                <img
                  src={c.image_paths[activePhotoIndex]}
                  alt={`${c.name} - Photo ${activePhotoIndex + 1}`}
                  className="h-full w-full object-cover transition-all duration-700 ease-out"
                  onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                />
                {/* Navigation arrows */}
                {c.image_paths.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIndex(activePhotoIndex === 0 ? c.image_paths.length - 1 : activePhotoIndex - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button
                      onClick={() => setActivePhotoIndex(activePhotoIndex === c.image_paths.length - 1 ? 0 : activePhotoIndex + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {c.image_paths.map((url, i) => (
                  <button key={i} onClick={() => setActivePhotoIndex(i)}
                    className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      i === activePhotoIndex ? 'border-primary shadow-md scale-105' : 'border-transparent opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* About Section */}
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
            {c.description && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  About {c.name}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              </div>
            )}

            {/* Key Stats Grid — Premium style */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {(c.fee_min || c.fee_max) && (
                <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 transition-all hover:shadow-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 mb-3">
                    <span className="text-lg font-bold text-purple-600">₹</span>
                  </div>
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Fee Range</p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    ₹{c.fee_min?.toLocaleString('en-IN') ?? '—'} – ₹{c.fee_max?.toLocaleString('en-IN') ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">INR / year</p>
                </div>
              )}
              {c.placement_rate != null && (
                <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 transition-all hover:shadow-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 mb-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14l4-4 3 3 5-7" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Placement Rate</p>
                  <p className="mt-1 text-sm font-bold text-foreground">{c.placement_rate}%</p>
                  <p className="text-[10px] text-muted-foreground">of students placed</p>
                </div>
              )}
              {c.avg_package != null && (
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 transition-all hover:shadow-soft">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Avg Package</p>
                  <p className="mt-1 text-sm font-bold text-foreground">₹{c.avg_package?.toLocaleString('en-IN')} LPA</p>
                  {c.highest_package != null && (
                    <p className="text-[10px] text-muted-foreground">Highest: ₹{c.highest_package?.toLocaleString('en-IN')} LPA</p>
                  )}
                </div>
              )}
              <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 transition-all hover:shadow-soft">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Visit Capacity</p>
                <p className="mt-1 text-sm font-bold text-foreground">{c.daily_visit_capacity} visitors/day</p>
                <p className="text-[10px] text-muted-foreground">Book in advance</p>
              </div>
            </div>

            {/* Highlights / Additional Info */}
            <div className="mt-6 flex flex-wrap gap-2">
              {c.ranking && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.333l2.06 4.174 4.607.67-3.334 3.25.787 4.586L8 11.847l-4.12 2.166.787-4.586L1.333 6.177l4.607-.67L8 1.333z"/></svg>
                  {c.ranking}
                </span>
              )}
              {c.hostel_available && (
                <span className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M10 21V17h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Hostel Available
                </span>
              )}
              {c.scholarship && (
                <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-xs font-semibold text-green-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Scholarship Available
                </span>
              )}
              {c.campus_size && (
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                  Campus: {c.campus_size}
                </span>
              )}
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Visit Website
                </a>
              )}
            </div>

            {/* Facilities */}
            {c.facilities && c.facilities.length > 0 && (
              <div className="mt-6 border-t border-border/40 pt-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Facilities & Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.facilities.map(f => (
                    <span key={f} className="rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Courses */}
        {courseList.length > 0 && (
          <AnimatedSection delay={0.1} className="mt-6">
            <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                Courses Offered ({courseList.length})
              </h2>
              <div className="mt-5 space-y-3">
                {courseList.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-xl border border-border/60 p-5 transition-all duration-300 hover:shadow-soft hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                        {course.course_name}
                      </h3>
                      <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                        {course.stream}
                      </span>
                    </div>
                    {course.branch && (
                      <p className="mt-1.5 text-sm text-muted-foreground">Branch: {course.branch}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {course.duration_years && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          {course.duration_years} years
                        </span>
                      )}
                      {course.annual_fee && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M10 4H6.5a2.5 2.5 0 000 5H9a2.5 2.5 0 010 5H5M8 2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          ₹{course.annual_fee.toLocaleString('en-IN')}/year
                        </span>
                      )}
                      {course.eligibility && (
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {course.eligibility}
                        </span>
                      )}
                    </div>
                    {course.exams_accepted.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {course.exams_accepted.map((exam) => (
                          <span key={exam} className="rounded-lg bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                            {exam}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* CTA */}
        <AnimatedSection delay={0.2} className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={isLoggedIn ? `/dashboard/bookings?college_id=${c.id}` : '/auth/login'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Book Counselling
            </Link>
            <Link
              href={isLoggedIn ? `/dashboard/visits?college_id=${c.id}` : '/auth/login'}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent hover:shadow-soft"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Request Visit
            </Link>
          </div>
        </AnimatedSection>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
