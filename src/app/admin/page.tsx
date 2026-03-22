'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Metrics {
  totalStudents: number
  totalColleges: number
  totalBookings: number
  totalVisits: number
  bookingsByStatus: Record<string, number>
  visitsByStatus: Record<string, number>
}

const statusStyles: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = () => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then((d) => {
        setMetrics(d.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchMetrics()

    // Auto-refresh every 30s
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
        </svg>
        Loading metrics...
      </div>
    )
  }

  if (!metrics) {
    return <p className="text-sm text-destructive">Failed to load metrics.</p>
  }

  const cards = [
    { label: 'Total Students', value: metrics.totalStudents, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', color: 'bg-primary-light text-primary' },
    { label: 'Total Colleges', value: metrics.totalColleges, icon: 'M12 14l9-5-9-5-9 5 9 5z', color: 'bg-surface-warm text-amber-700' },
    { label: 'Total Bookings', value: metrics.totalBookings, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-50 text-green-700' },
    { label: 'Total Visits', value: metrics.totalVisits, icon: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: 'bg-blue-50 text-blue-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of platform activity.</p>

      {/* Overview Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:shadow-lifted"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} transition-transform group-hover:scale-110`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d={card.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
              {card.value.toLocaleString('en-IN')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bookings by Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            Bookings by Status
          </h2>
          <div className="mt-5 space-y-3">
            {Object.entries(metrics.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] ?? statusStyles.pending}`}>
                    {status}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.bookingsByStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No booking data yet.</p>
            )}
          </div>
        </motion.div>

        {/* Visits by Status */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
            Visits by Status
          </h2>
          <div className="mt-5 space-y-3">
            {Object.entries(metrics.visitsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] ?? statusStyles.pending}`}>
                    {status}
                  </span>
                </div>
                <span className="text-sm font-bold text-foreground">{count}</span>
              </div>
            ))}
            {Object.keys(metrics.visitsByStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No visit data yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
