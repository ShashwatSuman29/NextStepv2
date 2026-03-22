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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-primary-dark py-16 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-4xl">
          <AnimatedSection>
            <Link href="/colleges" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition-colors mb-4">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to colleges
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{c.name}</h1>
              <SaveToggle collegeId={c.id} className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20" size={20} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-white/60">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
              </svg>
              {c.city}, {c.state}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-5 py-8">
        {/* Info card */}
        <AnimatedSection>
          <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
            {c.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {(c.fee_min || c.fee_max) && (
                <div className="rounded-xl bg-primary-light/50 p-4">
                  <p className="text-xs font-medium text-primary/70">Fee Range</p>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {c.fee_min?.toLocaleString('en-IN') ?? '—'} – {c.fee_max?.toLocaleString('en-IN') ?? '—'}
                  </p>
                  <p className="text-xs text-primary/50">INR/year</p>
                </div>
              )}
              <div className="rounded-xl bg-surface-warm p-4">
                <p className="text-xs font-medium text-secondary/70">Daily Visit Capacity</p>
                <p className="mt-1 text-sm font-bold text-secondary-foreground">{c.daily_visit_capacity} visitors/day</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-xs font-medium text-green-700/70">Courses Available</p>
                <p className="mt-1 text-sm font-bold text-green-800">{courseList.length}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Courses */}
        {courseList.length > 0 && (
          <AnimatedSection delay={0.1} className="mt-6">
            <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-soft">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                Courses Offered
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
                          {course.annual_fee.toLocaleString('en-IN')} INR/year
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
              href={isLoggedIn ? '/dashboard/bookings' : '/auth/login'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Book Counselling
            </Link>
            <Link
              href={isLoggedIn ? '/dashboard/visits' : '/auth/login'}
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
