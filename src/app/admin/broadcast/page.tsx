'use client'

import { useState } from 'react'

export default function AdminBroadcastPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    if (!confirm('Are you sure you want to email ALL students? This cannot be undone.')) {
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send broadcast')
      }

      setStatus({
        type: 'success',
        text: `Successfully sent broadcast to ${data.count || 'all'} students!`,
      })
      setMessage('')
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>
        Broadcast Announcements
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Send an email notification or special offer to every registered student at once.
      </p>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
        <form onSubmit={handleBroadcast} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-foreground">
              Announcement Message
            </label>
            <p className="mb-3 mt-1 text-xs text-muted-foreground">
              Write the text exactly as you want it to appear inside the notification email card.
            </p>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Get 20% off all Premium College Visits this weekend only! Click 'Go to Dashboard' to claim your offer."
              className="w-full rounded-xl border border-border bg-background p-4 text-sm resize-y focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {status && (
            <div
              className={`rounded-xl border p-4 text-sm font-semibold ${
                status.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Broadcast to All Students
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Preview</h3>
        <div className="mt-4 rounded-2xl border border-border/60 bg-card p-6 opacity-75 grayscale sepia-0 transition-all hover:grayscale-0 hover:opacity-100">
          <div className="mx-auto max-w-lg rounded-xl overflow-hidden border border-[#1f4d3c] bg-[#0f2e25] shadow-lg">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-4">New Notification from NextStep 🔔</h2>
              <div className="rounded-lg border border-[#1f4d3c] bg-[#12382d] p-4 text-left">
                <p className="text-[#22c55e] whitespace-pre-wrap">{message || 'Your message will appear here...'}</p>
              </div>
              <button className="mt-6 rounded-lg bg-[#22c55e] px-6 py-2.5 font-bold text-[#0b1f1a]">Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
