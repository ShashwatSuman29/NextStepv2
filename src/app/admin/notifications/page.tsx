'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface AdminNotification {
  id: string
  type: 'booking' | 'visit'
  status: string
  message: string
  studentName: string
  studentEmail: string
  detail: string
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'booking' | 'visit'>('all')

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/admin/notifications?limit=50&_t=${Date.now()}`)
      const data = await res.json()
      setNotifications(data.data ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const pendingCount = notifications.filter(n => n.status === 'pending').length
  const bookingCount = notifications.filter(n => n.type === 'booking').length
  const visitCount = notifications.filter(n => n.type === 'visit').length

  const displayed = notifications.filter(n => {
    if (filter === 'pending') return n.status === 'pending'
    if (filter === 'booking') return n.type === 'booking'
    if (filter === 'visit') return n.type === 'visit'
    return true
  })

  const typeIcon = (type: string) => {
    if (type === 'booking') return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    return 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount > 0
              ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} need your attention`
              : 'All caught up! No pending requests.'}
          </p>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">{pendingCount} pending</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{notifications.length} total</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: 'all' as const, label: `All (${notifications.length})` },
          { key: 'pending' as const, label: `Pending (${pendingCount})` },
          { key: 'booking' as const, label: `Bookings (${bookingCount})` },
          { key: 'visit' as const, label: `Visits (${visitCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border border-border bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : displayed.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            {filter === 'pending' ? 'No pending requests' : 'No activity found'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === 'pending'
              ? 'All booking and visit requests have been handled.'
              : 'New booking and visit requests will appear here.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          <AnimatePresence>
            {displayed.map((n, i) => (
              <motion.div
                key={`${n.type}-${n.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={n.type === 'booking' ? '/admin/bookings' : '/admin/visits'}
                  className={`flex items-start gap-4 rounded-2xl border p-5 transition-all hover:shadow-soft ${
                    n.status === 'pending'
                      ? 'border-amber-200/60 bg-amber-50/30 hover:bg-amber-50/50'
                      : 'border-border/40 bg-card hover:bg-muted/30'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${STATUS_STYLES[n.status] ?? STATUS_STYLES.pending}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d={typeIcon(n.type)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm leading-relaxed ${n.status === 'pending' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {n.message}
                      </p>
                      {n.status === 'pending' && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs text-muted-foreground">{n.detail}</span>
                      <span className="text-[10px] text-muted-foreground/60">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.studentEmail && (
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{n.studentEmail}</p>
                    )}
                  </div>

                  {/* Status + Type badges */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[n.status] ?? STATUS_STYLES.pending}`}>
                      {n.status}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      n.type === 'booking' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {n.type === 'booking' ? 'Counselling' : 'Visit'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
