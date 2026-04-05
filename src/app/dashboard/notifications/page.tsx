'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(data.data ?? [])
    setLoading(false)
  }

  const notifyBadge = () => {
    window.dispatchEvent(new Event('notifications-updated'))
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    notifyBadge()
  }

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    notifyBadge()
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    setNotifications(prev => prev.filter(n => n.id !== id))
    notifyBadge()
  }

  const deleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return
    await fetch('/api/notifications', { method: 'DELETE' })
    setNotifications([])
    notifyBadge()
  }

  useEffect(() => { fetchNotifications() }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length
  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications

  const typeIcon = (type: string) => {
    if (type.includes('booking')) return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    if (type.includes('visit')) return 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
    return 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  }

  const typeColor = (type: string) => {
    if (type.includes('confirmed')) return 'bg-green-50 text-green-600 border-green-100'
    if (type.includes('cancelled')) return 'bg-red-50 text-red-600 border-red-100'
    if (type.includes('completed')) return 'bg-blue-50 text-blue-600 border-blue-100'
    if (type === 'welcome') return 'bg-primary-light text-primary border-primary/10'
    return 'bg-amber-50 text-amber-600 border-amber-100'
  }

  // eslint-disable-next-line
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-xs font-semibold transition-all hover:bg-red-100 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${filter === 'all' ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${filter === 'unread' ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}
        >
          Unread ({unreadCount})
        </button>
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
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === 'unread' ? 'You\'re all caught up!' : 'Notifications about your bookings and visits will appear here.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          <AnimatePresence>
            {displayed.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`flex items-start gap-4 rounded-2xl border p-5 transition-all cursor-pointer ${
                  n.is_read
                    ? 'border-border/40 bg-card hover:bg-muted/30'
                    : 'border-primary/20 bg-primary/[0.02] shadow-soft hover:bg-primary/[0.04]'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${typeColor(n.type)}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d={typeIcon(n.type)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${n.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground font-medium">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch ml-2">
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="p-1.5 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  {!n.is_read && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-medium text-primary hidden sm:block">New</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
