'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CollegeCard } from '@/components/shared/college-card'
import { AnimatedSection } from '@/components/shared/animated-section'

interface College {
  id: string
  name: string
  city: string
  state: string
  fee_min: number | null
  fee_max: number | null
  image_paths: string[]
  description: string | null
  placement_rate: number | null
  college_type: string | null
  established_year: number | null
  accreditation: string | null
  hostel_available: boolean
  scholarship: boolean
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

const FEE_RANGES = [
  { label: 'Under ₹1 Lakh', min: 0, max: 100000 },
  { label: '₹1L – ₹3L', min: 100000, max: 300000 },
  { label: '₹3L – ₹5L', min: 300000, max: 500000 },
  { label: '₹5L – ₹10L', min: 500000, max: 1000000 },
  { label: 'Above ₹10L', min: 1000000, max: undefined },
]

function CollegesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [colleges, setColleges] = useState<College[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    state: searchParams.get('state') || '',
    stream: searchParams.get('stream') || '',
    course: searchParams.get('course') || '',
    college_type: searchParams.get('college_type') || '',
    fee_min: (searchParams.get('fee_min') || '') as string | number,
    fee_max: (searchParams.get('fee_max') || '') as string | number,
    has_hostel: searchParams.get('has_hostel') === 'true',
    has_scholarship: searchParams.get('has_scholarship') === 'true',
    placement_min: (searchParams.get('placement_min') || '') as string | number,
    sort_by: searchParams.get('sort_by') || '',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
    page: Number(searchParams.get('page')) || 1,
  })

  const fetchColleges = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', filters.page.toString())
    params.set('pageSize', '20')
    if (filters.search) params.set('search', filters.search)
    if (filters.state) params.set('state', filters.state)
    if (filters.stream) params.set('stream', filters.stream)
    if (filters.course) params.set('course', filters.course)
    if (filters.college_type) params.set('college_type', filters.college_type)
    if (filters.fee_min !== '') params.set('fee_min', filters.fee_min.toString())
    if (filters.fee_max !== '') params.set('fee_max', filters.fee_max.toString())
    if (filters.has_hostel) params.set('has_hostel', 'true')
    if (filters.has_scholarship) params.set('has_scholarship', 'true')
    if (filters.placement_min !== '') params.set('placement_min', filters.placement_min.toString())
    if (filters.sort_by) {
      params.set('sort_by', filters.sort_by)
      params.set('sort_order', filters.sort_order)
    }

    // Sync URL with filters
    router.replace(`?${params.toString()}`, { scroll: false })

    const res = await fetch(`/api/colleges?${params}`)
    const data = await res.json()
    setColleges(data.data ?? [])
    setCount(data.count ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchColleges()
  }, [filters.page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((f) => ({ ...f, page: 1 }))
    fetchColleges()
  }

  const applyFeeRange = (min: number, max: number | undefined) => {
    setFilters(f => ({ ...f, fee_min: min, fee_max: max ?? '', page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      search: '', state: '', stream: '', course: '', college_type: '',
      fee_min: '', fee_max: '', has_hostel: false, has_scholarship: false,
      placement_min: '', sort_by: '', sort_order: 'desc', page: 1,
    })
    setTimeout(fetchColleges, 0)
  }

  const activeFilterCount = [
    filters.state, filters.stream, filters.course, filters.college_type,
    filters.fee_min !== '' ? 'fee' : '',
    filters.has_hostel ? 'hostel' : '',
    filters.has_scholarship ? 'scholarship' : '',
    filters.placement_min !== '' ? 'placement' : '',
  ].filter(Boolean).length

  const totalPages = Math.ceil(count / 20)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Wrap navbar + hero so the spacer matches the hero background */}
      <div className="bg-primary-dark">
        <Navbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 px-5">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,158,11,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.3) 0%, transparent 50%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl text-center">
          <AnimatedSection>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Explore Colleges</h1>
            <p className="mt-3 text-white/60">
              Find the perfect college from our curated list of {count > 0 ? `${count}+` : ''} institutions across India.
            </p>
          </AnimatedSection>
        </div>
      </section>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <path d="M14 14l-4-4m1.333-3.333a4.667 4.667 0 11-9.333 0 4.667 4.667 0 019.333 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Search by college name..."
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button type="submit" className="shrink-0 rounded-xl bg-primary px-5 sm:px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5">
              Search
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border px-4 sm:px-5 py-2.5 text-sm font-semibold transition-all ${
                showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:bg-accent'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilterCount}</span>
              )}
            </button>
            <Link
              href="/colleges/compare"
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-border px-4 sm:px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-accent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Compare
            </Link>
          </div>
        </form>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Filter Colleges</h3>
                  <button onClick={clearFilters} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">Clear All</button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">State</label>
                    <select
                      value={filters.state}
                      onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value, page: 1 }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">All States</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Stream */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Stream</label>
                    <select
                      value={filters.stream}
                      onChange={(e) => setFilters((f) => ({ ...f, stream: e.target.value, page: 1 }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">All Streams</option>
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Course</label>
                    <input
                      type="text"
                      value={filters.course}
                      onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value, page: 1 }))}
                      placeholder="e.g. BTech, MBA"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* College Type */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">College Type</label>
                    <select
                      value={filters.college_type}
                      onChange={(e) => setFilters((f) => ({ ...f, college_type: e.target.value, page: 1 }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">All Types</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="deemed">Deemed</option>
                      <option value="autonomous">Autonomous</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Sort By</label>
                    <select
                      value={filters.sort_by}
                      onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value, page: 1 }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Newest First</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="fee_min">Lowest Fees</option>
                      <option value="placement_rate">Best Placement</option>
                      <option value="established_year">Established Year</option>
                    </select>
                  </div>
                </div>

                {/* Fee Range quick picks */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fee Range</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters(f => ({ ...f, fee_min: '', fee_max: '', page: 1 }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        filters.fee_min === '' && filters.fee_max === ''
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >All</button>
                    {FEE_RANGES.map(r => (
                      <button key={r.label} onClick={() => applyFeeRange(r.min, r.max)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          Number(filters.fee_min) === r.min && (r.max === undefined ? filters.fee_max === '' : Number(filters.fee_max) === r.max)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/30'
                        }`}
                      >{r.label}</button>
                    ))}
                  </div>
                </div>

                {/* Min Placement Rate */}
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Min Placement Rate (%)</label>
                    <input
                      type="number" min="0" max="100"
                      value={filters.placement_min}
                      onChange={(e) => setFilters(f => ({ ...f, placement_min: e.target.value === '' ? '' : Number(e.target.value), page: 1 }))}
                      placeholder="e.g. 70"
                      className="w-32 rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors">
                    <input type="checkbox" checked={filters.has_hostel} onChange={(e) => setFilters(f => ({ ...f, has_hostel: e.target.checked, page: 1 }))} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    Hostel
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm cursor-pointer hover:bg-accent transition-colors">
                    <input type="checkbox" checked={filters.has_scholarship} onChange={(e) => setFilters(f => ({ ...f, has_scholarship: e.target.checked, page: 1 }))} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    Scholarship
                  </label>
                </div>

                <button onClick={() => { setFilters(f => ({ ...f, page: 1 })); fetchColleges() }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading colleges...
          </div>
        ) : colleges.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="mt-4 text-muted-foreground">No colleges found matching your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-sm font-semibold text-primary hover:underline">Clear all filters</button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{colleges.length}</span> of{' '}
              <span className="font-semibold text-foreground">{count}</span> colleges
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {colleges.map((c, i) => (
                <CollegeCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  city={c.city}
                  state={c.state}
                  feeMin={c.fee_min}
                  feeMax={c.fee_max}
                  description={c.description}
                  placementRate={c.placement_rate}
                  collegeType={c.college_type}
                  imagePaths={c.image_paths}
                  establishedYear={c.established_year}
                  accreditation={c.accreditation}
                  hostelAvailable={c.hostel_available}
                  scholarship={c.scholarship}
                  index={i}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                  disabled={filters.page === 1}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-1 px-4">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setFilters((f) => ({ ...f, page }))}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          filters.page === page
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setFilters((f) => ({ ...f, page: Math.min(totalPages, f.page + 1) }))}
                  disabled={filters.page === totalPages}
                  className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40"
                >
                  Next
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  )
}

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading colleges...</div>}>
      <CollegesContent />
    </Suspense>
  )
}
