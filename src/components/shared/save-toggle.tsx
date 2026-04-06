'use client'

import { useState, useEffect, useRef } from 'react'

interface SaveToggleProps {
  collegeId: string
  className?: string
  size?: number
}

// Module-level cache: fetch saved IDs once, share across all instances
let savedIdsCache: Promise<string[] | null> | null = null
let cacheTimestamp = 0

function isKnownLoggedOut(): boolean {
  try { return sessionStorage.getItem('ns_no_auth') === '1' } catch { return false }
}

function setKnownLoggedOut() {
  try { sessionStorage.setItem('ns_no_auth', '1') } catch { /* ignore */ }
}

function clearKnownLoggedOut() {
  try { sessionStorage.removeItem('ns_no_auth') } catch { /* ignore */ }
}

function getSavedIds(): Promise<string[] | null> {
  // If we already know the user is not logged in, skip the request entirely
  if (isKnownLoggedOut()) return Promise.resolve(null)

  const now = Date.now()
  // Reuse cache for 10 seconds
  if (savedIdsCache && now - cacheTimestamp < 10000) return savedIdsCache

  cacheTimestamp = now
  savedIdsCache = fetch('/api/saved')
    .then(res => {
      if (res.status === 401) {
        setKnownLoggedOut() // persist: no further requests this session
        return null
      }
      if (!res.ok) return null
      return res.json()
    })
    .then(data => {
      if (!data) return null
      return (data.data ?? []).map((s: { college_id: string }) => s.college_id)
    })
    .catch(() => null)

  return savedIdsCache
}

// Reset logged-out flag (called on save/unsave — user is authenticated)
function resetAuthState() {
  clearKnownLoggedOut()
  savedIdsCache = null
  cacheTimestamp = 0
}

// Invalidate cache after save/unsave
function invalidateCache() {
  resetAuthState()
}

export function SaveToggle({ collegeId, className = '', size = 18 }: SaveToggleProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    getSavedIds().then(ids => {
      if (!mounted.current) return
      if (ids === null) return // not logged in
      setVisible(true)
      setSaved(ids.includes(collegeId))
    })
    return () => { mounted.current = false }
  }, [collegeId])

  if (!visible) return null

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    if (saved) {
      const res = await fetch(`/api/saved/${collegeId}`, { method: 'DELETE' })
      if (res.ok) { setSaved(false); invalidateCache() }
    } else {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: collegeId }),
      })
      if (res.ok) { setSaved(true); invalidateCache() }
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 ${className}`}
      aria-label={saved ? 'Unsave college' : 'Save college'}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-primary' : 'text-muted-foreground hover:text-primary'}>
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
