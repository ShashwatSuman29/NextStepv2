'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface NotificationBadgeProps {
  initialCount?: number
}

export function NotificationBadge({ initialCount = 0 }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(initialCount)

  const fetchCount = useCallback(async () => {
    try {
      // Cache-bust to ensure fresh data every time
      const res = await fetch(`/api/notifications?unread=true&_t=${Date.now()}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      const items = data.data ?? []
      setUnreadCount(items.filter((n: { is_read: boolean }) => !n.is_read).length)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    // Fetch fresh count on mount
    fetchCount()

    // Re-fetch when tab becomes visible (user returns from notifications page)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCount()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Also poll every 30 seconds
    const interval = setInterval(fetchCount, 30000)

    // Listen for custom event when notifications are marked as read / deleted
    const handleRead = () => {
      // Immediately set to 0 optimistically, then verify with fetch
      setUnreadCount(0)
      fetchCount()
    }
    window.addEventListener('notifications-updated', handleRead)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('notifications-updated', handleRead)
      clearInterval(interval)
    }
  }, [fetchCount])

  return (
    <Link
      href="/dashboard/notifications"
      className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
          {unreadCount}
        </span>
      )}
    </Link>
  )
}
