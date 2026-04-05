'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const STORAGE_KEY = 'admin-notif-last-seen'

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [newCount, setNewCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=15')
      const data = await res.json()
      const items: AdminNotification[] = data.data ?? []
      setNotifications(items)

      // Count pending items as "new" (requires action)
      const pendingCount = items.filter(n => n.status === 'pending').length
      setNewCount(pendingCount)
    } catch {
      // silently fail
    }
  }, [])

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && notifications.length === 0) {
      setLoading(true)
      fetchNotifications().finally(() => setLoading(false))
    }
  }

  const markAsSeen = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    // Pending count stays visible since those still need action
  }

  const typeColor = (type: string, status: string) => {
    if (status === 'pending') return 'bg-amber-50 text-amber-600 border-amber-200'
    if (status === 'confirmed') return 'bg-green-50 text-green-600 border-green-200'
    if (status === 'completed') return 'bg-blue-50 text-blue-600 border-blue-200'
    if (status === 'cancelled') return 'bg-red-50 text-red-600 border-red-200'
    return 'bg-primary/10 text-primary border-primary/20'
  }

  const typeIcon = (type: string) => {
    if (type === 'booking') return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    return 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary"
        aria-label="Admin Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {newCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white animate-pulse">
            {newCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Activity</h3>
              {newCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  {newCount} pending
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/bookings"
                onClick={() => setOpen(false)}
                className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                </svg>
                <span className="text-xs">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/50">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="mt-2 text-xs text-muted-foreground">No recent activity.</p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <Link
                    key={`${n.type}-${n.id}`}
                    href={n.type === 'booking' ? '/admin/bookings' : '/admin/visits'}
                    onClick={() => setOpen(false)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${
                      n.status === 'pending' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${typeColor(n.type, n.status)}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d={typeIcon(n.type)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${n.status === 'pending' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {n.detail}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                    {n.status === 'pending' && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5 flex items-center justify-between">
              <Link
                href="/admin/bookings"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Bookings
              </Link>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <Link
                href="/admin/visits"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Visits
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
