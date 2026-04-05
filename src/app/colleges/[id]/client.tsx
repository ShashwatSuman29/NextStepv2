'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection } from '@/components/shared/animated-section'
import { SaveToggle } from '@/components/shared/save-toggle'
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
            <img src={c.image_paths[0]} alt={`${c.name} campus`} className="h-full w-full object-cover opacity-30"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/80 to-primary-dark/40" />
          </div>
        )}
        {!hasPhotos && (
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
            }}
          />
        )}
        <div className="relative mx-auto max-w-5xl py-16 px-5">
          <AnimatedSection>
            <Link href="/colleges" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition-colors mb-4">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to colleges
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: 'var(--font-sans)' }}>{c.name}</h1>
              <SaveToggle collegeId={c.id} className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20" size={20} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-white/60 text-sm">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                </svg>
                {c.city}, {c.state}
              </span>
              {c.college_type && (
                <span className="rounded-lg bg-white/10 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white/80 capitalize">{c.college_type}</span>
              )}
              {c.established_year && (
                <span className="rounded-lg bg-white/10 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white/80">Est. {c.established_year}</span>
              )}
              {c.accreditation && (
                <span className="rounded-lg bg-gold/20 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-gold">{c.accreditation}</span>
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
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <h3 className="text-sm font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-sans)' }}>Campus Gallery</h3>
              <div className="relative rounded-xl overflow-hidden h-64 sm:h-80 bg-muted">
                <img
                  src={c.image_paths[activePhotoIndex]}
                  alt={`${c.name} - Photo ${activePhotoIndex + 1}`}
                  className="h-full w-full object-cover transition-all duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                />
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {c.image_paths.map((url, i) => (
                  <button key={i} onClick={() => setActivePhotoIndex(i)}
                    className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activePhotoIndex ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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

        {/* Info card */}
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
            {c.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            )}

            {/* Key Stats Grid */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(c.fee_min || c.fee_max) && (
                <div className="rounded-xl bg-primary-light/50 p-4">
                  <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">Fee Range</p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    ₹{c.fee_min?.toLocaleString('en-IN') ?? '—'} – ₹{c.fee_max?.toLocaleString('en-IN') ?? '—'}
                  </p>
                  <p className="text-[10px] text-primary/50">INR/year</p>
                </div>
              )}
              {c.placement_rate != null && (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-[10px] font-semibold text-green-700/70 uppercase tracking-wider">Placement Rate</p>
                  <p className="mt-1 text-sm font-bold text-green-800">{c.placement_rate}%</p>
                  <p className="text-[10px] text-green-600/50">of students placed</p>
                </div>
              )}
              {c.avg_package != null && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-[10px] font-semibold text-blue-700/70 uppercase tracking-wider">Avg Package</p>
                  <p className="mt-1 text-sm font-bold text-blue-800">₹{c.avg_package?.toLocaleString('en-IN')} LPA</p>
                  {c.highest_package != null && (
                    <p className="text-[10px] text-blue-600/50">Highest: ₹{c.highest_package?.toLocaleString('en-IN')} LPA</p>
                  )}
                </div>
              )}
              <div className="rounded-xl bg-surface-warm p-4">
                <p className="text-[10px] font-semibold text-secondary/70 uppercase tracking-wider">Visit Capacity</p>
                <p className="mt-1 text-sm font-bold text-secondary-foreground">{c.daily_visit_capacity} visitors/day</p>
                <p className="text-[10px] text-secondary/50">Book in advance</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-5 flex flex-wrap gap-2">
              {c.ranking && (
                <span className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.333l2.06 4.174 4.607.67-3.334 3.25.787 4.586L8 11.847l-4.12 2.166.787-4.586L1.333 6.177l4.607-.67L8 1.333z"/></svg>
                  {c.ranking}
                </span>
              )}
              {c.hostel_available && (
                <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Hostel Available</span>
              )}
              {c.scholarship && (
                <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">Scholarship Available</span>
              )}
              {c.campus_size && (
                <span className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">Campus: {c.campus_size}</span>
              )}
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Visit Website
                </a>
              )}
            </div>

            {/* Facilities */}
            {c.facilities && c.facilities.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {c.facilities.map(f => (
                    <span key={f} className="rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">{f}</span>
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
