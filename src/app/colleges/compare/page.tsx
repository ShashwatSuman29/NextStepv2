'use client'

import { Suspense, useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AnimatedSection } from '@/components/shared/animated-section'

interface CollegeWithCourses {
  id: string
  name: string
  city: string
  state: string
  description: string | null
  fee_min: number | null
  fee_max: number | null
  daily_visit_capacity: number
  placement_rate: number | null
  avg_package: number | null
  highest_package: number | null
  hostel_available: boolean
  scholarship: boolean
  accreditation: string | null
  college_type: string | null
  ranking: number | null
  campus_size: string | null
  established_year: number | null
  website: string | null
  facilities: string[]
  image_paths: string[]
  college_courses: Array<{
    id: string
    course_name: string
    branch: string | null
    stream: string
    duration_years: number | null
    annual_fee: number | null
    exams_accepted: string[]
  }>
}

interface CollegeSummary {
  id: string
  name: string
  city: string
  state: string
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>}>
      <ComparePageContent />
    </Suspense>
  )
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [colleges, setColleges] = useState<CollegeWithCourses[]>([])
  const [allColleges, setAllColleges] = useState<CollegeSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [allCollegesLoading, setAllCollegesLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load all colleges for the picker
  useEffect(() => {
    const fetchAllColleges = async () => {
      setAllCollegesLoading(true)
      try {
        const res = await fetch('/api/colleges?pageSize=50')
        const data = await res.json()
        setAllColleges(
          (data.data ?? []).map((c: CollegeSummary) => ({
            id: c.id,
            name: c.name,
            city: c.city,
            state: c.state,
          }))
        )
      } catch {
        // silently fail
      }
      setAllCollegesLoading(false)
    }
    fetchAllColleges()
  }, [])

  // Pre-select colleges from URL params (e.g., ?ids=id1,id2)
  useEffect(() => {
    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean).slice(0, 3)
      if (ids.length > 0) {
        // eslint-disable-next-line
        setSelectedIds(ids)
      }
    }
  }, [searchParams])

  // Fetch full comparison data via the API when selection changes
  const fetchComparison = useCallback(async (ids: string[]) => {
    if (ids.length < 2) {
      setColleges([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/colleges/compare?ids=${ids.join(',')}`)
      const data = await res.json()
      if (data.data) {
        // Preserve the order of selected IDs
        const ordered = ids
          .map(id => (data.data as CollegeWithCourses[]).find(c => c.id === id))
          .filter(Boolean) as CollegeWithCourses[]
        setColleges(ordered)
      } else {
        setColleges([])
      }
    } catch {
      setColleges([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line
    fetchComparison(selectedIds)
  }, [selectedIds, fetchComparison])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when picker opens
  useEffect(() => {
    if (pickerOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [pickerOpen])

  const addCollege = (id: string) => {
    if (selectedIds.length >= 3 || selectedIds.includes(id)) return
    setSelectedIds(prev => [...prev, id])
    setPickerOpen(false)
    setSearchQuery('')
  }

  const removeCollege = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id))
  }

  const availableColleges = allColleges.filter(c => !selectedIds.includes(c.id))

  const filteredColleges = searchQuery.trim()
    ? availableColleges.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableColleges

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-primary-dark">
        <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-14 px-5">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#95d5b2]/20 blur-[100px]" />
        <div className="absolute -left-16 top-0 h-48 w-48 rounded-full bg-[#74c69d]/15 blur-[80px]" />
        <div className="relative mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/80">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                Compare Colleges
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/50">
                Select up to 3 colleges for a detailed side-by-side comparison of fees, placements, courses, and more.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-8">
        {/* College selector */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/[0.07]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Select Colleges
                </h2>
                <p className="text-[11px] text-muted-foreground">{selectedIds.length} of 3 selected</p>
              </div>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selected college chips */}
            {selectedIds.map((id, idx) => {
              const c = allColleges.find(x => x.id === id)
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {c?.name ?? 'Loading...'}
                    </span>
                    {c && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {c.city}, {c.state}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeCollege(id)}
                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M9 3L3 9M3 3l6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </motion.div>
              )
            })}

            {/* Add college button + dropdown */}
            {selectedIds.length < 3 && (
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 3.333v9.334M3.333 8h9.334"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {selectedIds.length === 0
                    ? 'Add first college'
                    : selectedIds.length === 1
                    ? 'Add second college'
                    : 'Add third college (optional)'}
                </button>

                <AnimatePresence>
                  {pickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-0 top-full z-20 mt-2 w-96 max-h-80 overflow-hidden rounded-xl border border-border bg-card shadow-lifted"
                    >
                      {/* Search input */}
                      <div className="border-b border-border p-3">
                        <div className="relative">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            <path
                              d="M14 14l-4-4m1.333-3.333a4.667 4.667 0 11-9.333 0 4.667 4.667 0 019.333 0z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search colleges by name, city, or state..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>

                      {/* College list */}
                      <div className="max-h-60 overflow-y-auto p-2">
                        {allCollegesLoading ? (
                          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="opacity-25"
                              />
                              <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className="opacity-75"
                              />
                            </svg>
                            Loading colleges...
                          </div>
                        ) : filteredColleges.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            {searchQuery
                              ? 'No colleges match your search.'
                              : 'No more colleges available.'}
                          </p>
                        ) : (
                          filteredColleges.map(c => (
                            <button
                              key={c.id}
                              onClick={() => addCollege(c.id)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                {c.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {c.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {c.city}, {c.state}
                                </p>
                              </div>
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="shrink-0 text-muted-foreground"
                              >
                                <path
                                  d="M8 3.333v9.334M3.333 8h9.334"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {selectedIds.length === 0 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="text-muted-foreground"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M9 14l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="mt-5 text-xl font-bold text-foreground"
            >
              Start Comparing Colleges
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Select 2 or 3 colleges above to see a detailed side-by-side comparison
              of fees, courses, streams, exams accepted, and more.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3.333v9.334M3.333 8h9.334"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Select Colleges
              </button>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent"
              >
                Browse Colleges
              </Link>
            </div>
          </div>
        )}

        {/* Single college selected - prompt for more */}
        {selectedIds.length === 1 && !loading && (
          <div className="mt-12 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-500"
              >
                <path
                  d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Add at least one more college to start comparing.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select 2 or 3 colleges for a side-by-side comparison.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && selectedIds.length >= 2 && (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
            Loading comparison...
          </div>
        )}

        {/* Comparison table */}
        {colleges.length >= 2 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 overflow-x-auto"
          >
            <div className="min-w-[640px]">
              {/* Header row */}
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)`,
                }}
              >
                <div className="flex items-end px-4 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Criteria
                  </span>
                </div>
                {colleges.map((c, idx) => {
                  const colors = ['bg-[#4285F4]/10 text-[#4285F4]', 'bg-[#FF9800]/10 text-[#FF9800]', 'bg-[#2E7D32]/10 text-[#2E7D32]']
                  const borderColors = ['border-[#4285F4]/20', 'border-[#FF9800]/20', 'border-[#2E7D32]/20']
                  return (
                    <div
                      key={c.id}
                      className={`rounded-t-2xl border-2 ${borderColors[idx]} bg-card p-5 text-center`}
                    >
                      <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${colors[idx]} text-sm font-bold`}>
                        {c.name.charAt(0)}
                      </div>
                      <h3
                        className="text-base font-bold text-foreground"
                      >
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.city}, {c.state}
                      </p>
                      {c.accreditation && (
                        <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {c.accreditation}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Comparison rows */}
              {[
                {
                  label: 'Location',
                  render: (c: CollegeWithCourses) => (
                    <div className="flex items-center gap-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="shrink-0 text-primary/60"
                      >
                        <path
                          d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="text-sm text-foreground">
                        {c.city}, {c.state}
                      </span>
                    </div>
                  ),
                },
                {
                  label: 'Fee Range',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-semibold text-primary">
                      {c.fee_min != null
                        ? `₹${c.fee_min.toLocaleString('en-IN')}`
                        : '—'}{' '}
                      –{' '}
                      {c.fee_max != null
                        ? `₹${c.fee_max.toLocaleString('en-IN')}`
                        : '—'}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        /year
                      </span>
                    </span>
                  ),
                },
                {
                  label: 'College Type',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground capitalize">
                      {c.college_type ?? '—'}
                    </span>
                  ),
                },
                {
                  label: 'Established',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">
                      {c.established_year ?? '—'}
                    </span>
                  ),
                },
                {
                  label: 'Accreditation',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-medium text-foreground">
                      {c.accreditation ?? '—'}
                    </span>
                  ),
                },
                {
                  label: 'Ranking',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">
                      {c.ranking ? `#${c.ranking}` : '—'}
                    </span>
                  ),
                },
                {
                  label: 'Placement Rate',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-semibold text-primary">
                      {c.placement_rate != null ? `${c.placement_rate}%` : '—'}
                    </span>
                  ),
                },
                {
                  label: 'Avg Package',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-semibold text-foreground">
                      {c.avg_package != null
                        ? `₹${(c.avg_package / 100000).toFixed(1)} LPA`
                        : '—'}
                    </span>
                  ),
                },
                {
                  label: 'Highest Package',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm font-semibold text-foreground">
                      {c.highest_package != null
                        ? `₹${(c.highest_package / 100000).toFixed(1)} LPA`
                        : '—'}
                    </span>
                  ),
                },
                {
                  label: 'Hostel',
                  render: (c: CollegeWithCourses) => (
                    <div className="flex items-center gap-1.5">
                      {c.hostel_available ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="text-sm text-green-700 font-medium">Available</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          <span className="text-sm text-muted-foreground">Not available</span>
                        </>
                      )}
                    </div>
                  ),
                },
                {
                  label: 'Scholarship',
                  render: (c: CollegeWithCourses) => (
                    <div className="flex items-center gap-1.5">
                      {c.scholarship ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="text-sm text-green-700 font-medium">Available</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-red-500"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          <span className="text-sm text-muted-foreground">Not available</span>
                        </>
                      )}
                    </div>
                  ),
                },
                {
                  label: 'Campus Size',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">
                      {c.campus_size ?? '—'}
                    </span>
                  ),
                },
                {
                  label: 'Facilities',
                  render: (c: CollegeWithCourses) => (
                    c.facilities?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.facilities.slice(0, 5).map(f => (
                          <span key={f} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{f}</span>
                        ))}
                        {c.facilities.length > 5 && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">+{c.facilities.length - 5} more</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )
                  ),
                },
                {
                  label: 'Daily Visit Capacity',
                  render: (c: CollegeWithCourses) => (
                    <span className="text-sm text-foreground">
                      {c.daily_visit_capacity} visitors/day
                    </span>
                  ),
                },
                {
                  label: 'Available Courses',
                  render: (c: CollegeWithCourses) => (
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {c.college_courses.length}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        courses
                      </span>
                      {c.college_courses.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.college_courses.slice(0, 4).map(cc => (
                            <span
                              key={cc.id}
                              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {cc.course_name}
                            </span>
                          ))}
                          {c.college_courses.length > 4 && (
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              +{c.college_courses.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  label: 'Streams',
                  render: (c: CollegeWithCourses) => {
                    const streams = [
                      ...new Set(c.college_courses.map(cc => cc.stream)),
                    ]
                    return streams.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {streams.map(s => (
                          <span
                            key={s}
                            className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        —
                      </span>
                    )
                  },
                },
                {
                  label: 'Exams Accepted',
                  render: (c: CollegeWithCourses) => {
                    const exams = [
                      ...new Set(
                        c.college_courses.flatMap(cc => cc.exams_accepted)
                      ),
                    ]
                    return exams.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {exams.map(e => (
                          <span
                            key={e}
                            className="rounded-lg bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        —
                      </span>
                    )
                  },
                },
              ].map((row, ri) => (
                <div
                  key={row.label}
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)`,
                  }}
                >
                  <div
                    className={`flex items-center px-4 py-4 text-sm font-semibold text-muted-foreground ${
                      ri % 2 === 0 ? 'bg-muted/30 rounded-l-xl' : ''
                    }`}
                  >
                    {row.label}
                  </div>
                  {colleges.map(c => (
                    <div
                      key={c.id}
                      className={`flex items-center border-x border-border/40 px-5 py-4 ${
                        ri % 2 === 0 ? 'bg-muted/30' : ''
                      }`}
                    >
                      {row.render(c)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Course-by-course comparison */}
              {(() => {
                const allCourseNames = [
                  ...new Set(
                    colleges.flatMap(c =>
                      c.college_courses.map(cc => cc.course_name)
                    )
                  ),
                ].sort()

                if (allCourseNames.length === 0) return null

                return (
                  <>
                    <div
                      className="mt-6 grid gap-4"
                      style={{
                        gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)`,
                      }}
                    >
                      <div className="flex items-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Course Details
                      </div>
                      {colleges.map(c => (
                        <div
                          key={c.id}
                          className="border-x border-border/40 px-5 py-3"
                        />
                      ))}
                    </div>

                    {allCourseNames.slice(0, 10).map((courseName, ci) => (
                      <div
                        key={courseName}
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns: `180px repeat(${colleges.length}, 1fr)`,
                        }}
                      >
                        <div
                          className={`flex items-center px-4 py-3 text-xs font-medium text-foreground ${
                            ci % 2 === 0 ? 'bg-muted/20 rounded-l-lg' : ''
                          }`}
                        >
                          {courseName}
                        </div>
                        {colleges.map(c => {
                          const course = c.college_courses.find(
                            cc => cc.course_name === courseName
                          )
                          return (
                            <div
                              key={c.id}
                              className={`border-x border-border/40 px-5 py-3 ${
                                ci % 2 === 0 ? 'bg-muted/20' : ''
                              }`}
                            >
                              {course ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {course.annual_fee
                                      ? `₹${course.annual_fee.toLocaleString('en-IN')}/yr`
                                      : '—'}
                                  </p>
                                  {course.duration_years && (
                                    <p className="text-xs text-muted-foreground">
                                      {course.duration_years} years
                                    </p>
                                  )}
                                  {course.branch && (
                                    <p className="text-xs text-muted-foreground">
                                      {course.branch}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">
                                  Not offered
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </>
                )
              })()}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}
