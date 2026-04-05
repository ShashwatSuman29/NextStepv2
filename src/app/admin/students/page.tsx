'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StudentProfile {
  full_name: string
  city: string
  state: string
  stream: string
  is_complete: boolean
  phone: string | null
  marks_10th: number | null
  marks_12th: number | null
  jee_rank: number | null
  mht_cet_score: number | null
  desired_course: string | null
  desired_branch: string | null
  gender: string | null
  date_of_birth: string | null
  board_10th: string | null
  board_12th: string | null
  budget_min: number | null
  budget_max: number | null
  parent_name: string | null
  parent_phone: string | null
  address: string | null
  pincode: string | null
  other_exam_name: string | null
  other_exam_score: number | null
}

interface Student {
  id: string
  email: string
  is_verified: boolean
  created_at: string
  student_profiles: StudentProfile[]
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchStudents = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), pageSize: '20' })
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/students?${params}`)
    const data = await res.json()
    setStudents(data.data ?? [])
    setTotalCount(data.count ?? 0)
    setLoading(false)
  }

  // eslint-disable-next-line
  useEffect(() => { fetchStudents() }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchStudents()
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Students</h1>
      <p className="mt-1 text-sm text-muted-foreground">View and manage registered students with detailed profiles.</p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <path d="M14 14l-4-4m1.333-3.333a4.667 4.667 0 11-9.333 0 4.667 4.667 0 019.333 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90">
          Search
        </button>
      </form>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount}</span> students total
          </p>

          <div className="mt-3 space-y-3">
            {students.map((s) => {
              const p = s.student_profiles?.[0]
              const isExpanded = expandedId === s.id
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden"
                >
                  {/* Summary row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full flex flex-col gap-0 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between p-5 pb-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-sm font-bold text-white shadow-sm shrink-0">
                          {(p?.full_name || s.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p?.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {p?.stream && <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold text-primary">{p.stream}</span>}
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold flex items-center gap-1 ${
                          p?.is_complete
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>
                          {p?.is_complete && (
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                          {p?.is_complete ? '100% Complete' : 'Incomplete'}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Quick info chips — always visible */}
                    <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                      {p?.phone && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-primary/60"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          {p.phone}
                        </span>
                      )}
                      {p?.city && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-primary/60"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                          {p.city}, {p.state}
                        </span>
                      )}
                      {p?.desired_course && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-primary/60"><path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l6.16-3.422A12.083 12.083 0 0121 17.5c-3 1.5-6 2.5-9 2.5s-6-1-9-2.5a12.083 12.083 0 012.84-6.922L12 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {p.desired_course}{p.desired_branch ? ` — ${p.desired_branch}` : ''}
                        </span>
                      )}
                      {(p?.budget_min != null || p?.budget_max != null) && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                          <span className="font-bold text-primary">₹</span>
                          {(p.budget_min ?? 0).toLocaleString('en-IN')} – ₹{(p.budget_max ?? 0).toLocaleString('en-IN')}/yr
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        {/* Quick contact bar */}
                        <div className="border-t border-border/40 px-5 py-3 bg-primary/[0.03] flex flex-wrap items-center gap-3">
                          <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 hover:bg-primary/[0.04] transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {s.email}
                          </a>
                          {p?.phone && (
                            <a href={`tel:${p.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 hover:bg-primary/[0.04] transition-colors">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              {p.phone}
                            </a>
                          )}
                          {p?.parent_phone && (
                            <a href={`tel:${p.parent_phone}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 hover:bg-primary/[0.04] transition-colors">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-muted-foreground"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              Parent: {p.parent_phone}
                            </a>
                          )}
                          {p?.phone && (
                            <a href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 hover:bg-primary/[0.04] transition-colors">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              WhatsApp
                            </a>
                          )}
                        </div>

                        {p ? (
                          <div className="border-t border-border/40 p-5 bg-muted/20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Personal */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Personal Info</h4>
                              <InfoRow label="Full Name" value={p.full_name} />
                              <InfoRow label="Phone" value={p.phone} isPhone />
                              <InfoRow label="Gender" value={p.gender} />
                              <InfoRow label="Date of Birth" value={p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : null} />
                              <InfoRow label="City" value={p.city} />
                              <InfoRow label="State" value={p.state} />
                              <InfoRow label="Address" value={p.address} />
                              <InfoRow label="Pincode" value={p.pincode} />
                            </div>
                            {/* Family */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Family & Academic</h4>
                              <InfoRow label="Parent Name" value={p.parent_name} />
                              <InfoRow label="Parent Phone" value={p.parent_phone} isPhone />
                              <div className="my-2 h-px bg-border/30" />
                              <InfoRow label="Stream" value={p.stream} />
                              <InfoRow label="10th Marks" value={p.marks_10th != null ? `${p.marks_10th}%` : null} />
                              <InfoRow label="10th Board" value={p.board_10th} />
                              <InfoRow label="12th Marks" value={p.marks_12th != null ? `${p.marks_12th}%` : null} />
                              <InfoRow label="12th Board" value={p.board_12th} />
                            </div>
                            {/* Preferences & Exams */}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferences & Exams</h4>
                              <InfoRow label="Desired Course" value={p.desired_course} />
                              <InfoRow label="Desired Branch" value={p.desired_branch} />
                              <InfoRow label="Budget" value={
                                p.budget_min || p.budget_max
                                  ? `₹${(p.budget_min ?? 0).toLocaleString('en-IN')} – ₹${(p.budget_max ?? 0).toLocaleString('en-IN')}/yr`
                                  : null
                              } />
                              <div className="my-2 h-px bg-border/30" />
                              <InfoRow label="JEE Rank" value={p.jee_rank?.toString()} />
                              <InfoRow label="MHT-CET Score" value={p.mht_cet_score?.toString()} />
                              {p.other_exam_name && <InfoRow label={p.other_exam_name} value={p.other_exam_score?.toString()} />}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-border/40 p-5 bg-muted/20">
                            <p className="text-xs text-muted-foreground italic">This student hasn&apos;t filled in their profile yet. Only email contact is available.</p>
                          </div>
                        )}

                        <div className="border-t border-border/40 px-5 py-3 bg-muted/10 flex items-center justify-between">
                          <p className="text-[10px] text-muted-foreground">
                            Joined {new Date(s.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {s.is_verified && <span className="ml-2 text-primary font-medium">• Email verified</span>}
                          </p>
                          <span className="text-[10px] text-muted-foreground/50 font-mono">{s.id.slice(0, 8)}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {students.length === 0 && (
            <div className="mt-8 flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No students found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Previous
              </button>
              <span className="px-3 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-accent disabled:opacity-40">
                Next
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value, isPhone }: { label: string; value: string | null | undefined; isPhone?: boolean }) {
  const display = value || '—'
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[11px] text-muted-foreground shrink-0">{label}</span>
      {isPhone && value ? (
        <a href={`tel:${value}`} className="text-[11px] font-medium text-primary hover:underline text-right truncate">{display}</a>
      ) : (
        <span className={`text-[11px] font-medium text-right truncate ${value ? 'text-foreground' : 'text-muted-foreground/40'}`}>{display}</span>
      )}
    </div>
  )
}
