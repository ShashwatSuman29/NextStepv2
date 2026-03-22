'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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
    const res = await fetch('/api/visits')
    const data = await res.json()
    setVisits(data.data ?? [])
    setLoading(false)
  }

  const fetchColleges = async () => {
    const res = await fetch('/api/colleges?pageSize=50')
    const data = await res.json()
    setColleges(data.data ?? [])
  }

  useEffect(() => {
    fetchVisits()
    fetchColleges()

    // Auto-refresh every 30s for real-time status updates from admin
    const interval = setInterval(() => {
      fetchVisits()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRequest = async () => {
    if (!selectedCollege || !visitDate) return
    setSubmitting(true)
    setMessage('')

    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        college_id: selectedCollege,
        visit_date: visitDate,
      }),
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

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Campus Visits</h1>
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
          {showForm ? 'Cancel' : 'Request Visit'}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-sm ${
            messageType === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4"
        >
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            Request a Campus Visit
          </h3>
          <div>
            <label className="block text-sm font-medium text-foreground">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a college</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.city}, {c.state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Preferred Visit Date</label>
            <input
              type="date"
              value={visitDate}
              min={minDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <div className="mt-6 flex flex-col items-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">No visit requests yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {visits.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-5 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">Campus Visit</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                  {v.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
