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

    // Load Razorpay SDK
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      clearInterval(interval)
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async (amount: number) => {
    try {
      setMessageType('success')
      setMessage('Unlocking Secure Checkout...')
      
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: 'visit' }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "NextStep Premium",
        description: "Campus Visit Pass",
        order_id: order.id,
        handler: async function (response: any) {
          setMessage('Verifying payment...')
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, type: 'visit' })
          })
          if (verify.ok) {
            setMessage('Payment unlocked! Finalizing your booking...')
            handleRequest() // Automatically retry booking now that they have a credit
          } else {
            setMessageType('error')
            setMessage('Payment verification failed. Please contact support.')
          }
        },
        theme: { color: "#4f46e5" }
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (e: any) {
      setMessageType('error')
      setMessage(e.message || 'Failed to initialize checkout')
    }
  }

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
      if (res.status === 402) {
        setMessageType('error')
        setMessage(`Free limit maxed. Triggering premium unlock processing...`)
        handlePayment(data.price)
      } else {
        setMessageType('error')
        setMessage(data.error || 'Failed to request visit')
      }
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

  const activeVisits = visits.filter(v => v.status === 'pending' || v.status === 'confirmed')
  const pastVisits = visits.filter(v => v.status === 'completed' || v.status === 'cancelled')

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {/* Page header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2d6a4f] p-6 sm:p-8 shadow-lg">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-[#95d5b2]/20 blur-[80px]" />
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#74c69d]/15 blur-[60px]" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white/80">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                Campus Visits
              </h1>
              <p className="mt-0.5 text-sm text-white/50">
                Request and track your college campus visits
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
              showForm
                ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 border border-white/10'
                : 'bg-white text-[#2d6a4f] hover:bg-white/90 shadow-md'
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
        {/* Quick stats */}
        <div className="relative mt-5 flex items-center gap-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs text-white/50">{activeVisits.length} pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/50">{pastVisits.length} completed</span>
          </div>
        </div>
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
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
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
        {loading ? (
          <div className="mt-4 flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading your visits...
          </div>
        ) : visits.length === 0 ? (
          <div className="mt-6 flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No visit requests yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Schedule your first campus visit to explore a college in person.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Request Visit
            </button>
          </div>
        ) : (
          <>
            {/* Active visits */}
            {activeVisits.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Upcoming Visits
                </h2>
                <div className="mt-4 space-y-3">
                  {activeVisits.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group rounded-2xl border ${v.status === 'confirmed' ? 'border-green-200' : 'border-amber-200'} bg-card p-5 transition-all duration-300 hover:shadow-soft`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Date badge */}
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                              {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold leading-tight">
                              {new Date(v.visit_date + 'T00:00:00').getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{getCollegeName(v.college_id)}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground italic">
                              {statusMsg[v.status] ?? ''}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${v.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          {v.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past visits */}
            {pastVisits.length > 0 && (
              <div className={activeVisits.length > 0 ? 'mt-8' : ''}>
                <h2 className="text-lg font-bold text-foreground">
                  Past Visits
                </h2>
                <div className="mt-4 space-y-2">
                  {pastVisits.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${v.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d={statusIcon[v.status] ?? statusIcon.pending} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{getCollegeName(v.college_id)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-xl border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                        {v.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
