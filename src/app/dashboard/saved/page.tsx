'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface SavedCollege {
  id: string
  college_id: string
  college: {
    id: string
    name: string
    city: string
    state: string
    fee_min: number | null
    fee_max: number | null
    image_paths: string[]
    college_type: string | null
    placement_rate: number | null
  }
}

export default function SavedCollegesPage() {
  const [saved, setSaved] = useState<SavedCollege[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved')
      const data = await res.json()
      setSaved(data.data ?? [])
    } catch {
      // network error
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (collegeId: string) => {
    const res = await fetch(`/api/saved/${collegeId}`, { method: 'DELETE' })
    if (res.ok) {
      setSaved((prev) => prev.filter((s) => s.college_id !== collegeId))
    }
  }

  useEffect(() => {
    fetchSaved()
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Saved Colleges</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {saved.length > 0 ? `${saved.length} college${saved.length > 1 ? 's' : ''} saved` : 'Save colleges for quick comparison.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved.length > 1 && (
            <Link
              href="/colleges/compare"
              className="hidden items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-all duration-300 hover:bg-accent hover:-translate-y-0.5 sm:inline-flex"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Compare
            </Link>
          )}
          <Link
            href="/colleges"
            className="hidden items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5 sm:inline-flex"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Browse Colleges
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>No saved colleges yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start exploring and save colleges you are interested in.</p>
          <Link
            href="/colleges"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
          >
            Browse Colleges
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {saved.map((s) => {
              const c = s.college
              const hasImage = c?.image_paths?.length > 0
              return (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lifted"
                >
                  {/* Image header */}
                  {hasImage ? (
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      <img src={c.image_paths[0]} alt={c?.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {c?.college_type && (
                        <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground capitalize backdrop-blur-sm">{c.college_type}</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-3 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
                  )}

                  <div className="p-5">
                    <Link href={`/colleges/${s.college_id}`} className="block">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-primary">
                          <path d="M8 1.333A4.672 4.672 0 003.333 6C3.333 9.5 8 14.667 8 14.667S12.667 9.5 12.667 6A4.672 4.672 0 008 1.333z" fill="currentColor"/>
                        </svg>
                        {c?.city}, {c?.state}
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-foreground transition-colors group-hover:text-primary" style={{ fontFamily: 'var(--font-sans)' }}>
                        {c?.name}
                      </h3>
                    </Link>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {(c?.fee_min || c?.fee_max) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/5 px-2 py-1 text-xs font-semibold text-primary">
                          ₹{c.fee_min?.toLocaleString('en-IN') ?? '—'} – ₹{c.fee_max?.toLocaleString('en-IN') ?? '—'}
                        </span>
                      )}
                      {c?.placement_rate != null && (
                        <span className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700 border border-green-100">
                          {c.placement_rate}% placement
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                      <Link href={`/colleges/${s.college_id}`} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemove(s.college_id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
