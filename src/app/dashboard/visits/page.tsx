'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Visit {
  id: string
  status: string
  visit_date: string
  visit_time: string | null
  created_at: string
  college_id: string
}

interface College {
  id: string
  name: string
  city: string
  state: string
}

const statusStyles: Record<string, string> = {
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

const statusIcon: Record<string, string> = {
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  confirmed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  cancelled: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
}

const statusMsg: Record<string, string> = {
  pending: 'Your visit request is being reviewed. We\'ll confirm shortly.',
  confirmed: 'Visit confirmed! You\'re all set for your campus visit.',
  completed: 'This campus visit has been completed.',
  cancelled: 'This visit request was cancelled.',
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits')
      const data = await res.json()
      setVisits(data.data ?? [])
    } catch {
      // network error — keep existing state
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/colleges?pageSize=50')
      const data = await res.json()
      setColleges(data.data ?? [])
    } catch {
      // network error
    }
  }

  useEffect(() => {
    fetchVisits()
    fetchColleges()
    
    // Auto-select college if passed in URL context
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const collegeId = params.get('college_id')
      if (collegeId) {
        setSelectedCollege(collegeId)
        setShowForm(true)
      }
    }

    const interval = setInterval(() => { fetchVisits() }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRequest = async () => {
    if (!selectedCollege || !visitDate) return
    setSubmitting(true)
    setMessage('')

    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ college_id: selectedCollege, visit_date: visitDate }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessageType('success')
      setMessage('Visit request submitted! We will confirm your visit shortly.')
      setShowForm(false)
      setSelectedCollege('')
      setVisitDate('')
      fetchVisits()
    } else {
      setMessageType('error')
      setMessage(data.error || 'Failed to request visit')
    }
    setSubmitting(false)
  }

  const [minDate, setMinDate] = useState('')

  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setMinDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const getCollegeName = (id: string) => colleges.find(c => c.id === id)?.name ?? 'College'

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Campus Visits</h1>
          <p className="mt-1 text-sm text-muted-foreground">Request and track your college campus visits.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
            showForm
              ? 'border border-border bg-card text-foreground hover:bg-accent'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {showForm ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Request Visit
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${
              messageType === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d={messageType === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {message}
            <button onClick={() => setMessage('')} className="ml-auto text-xs font-medium hover:opacity-70">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-5"
          >
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Request a Campus Visit
            </h3>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">College</label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a college</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.city}, {c.state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Preferred Visit Date</label>
              <input
                type="date"
                value={visitDate}
                min={minDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleRequest}
              disabled={submitting || !selectedCollege || !visitDate}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visits list */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Your Visit Requests
        </h2>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading...
          </div>
        ) : visits.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border/60 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No visit requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Click &quot;Request Visit&quot; to schedule a campus visit.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {visits.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-lifted"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusStyles[v.status] ?? statusStyles.pending}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d={statusIcon[v.status] ?? statusIcon.pending} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{getCollegeName(v.college_id)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                    {v.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground italic pl-[52px]">
                  {statusMsg[v.status] ?? ''}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
