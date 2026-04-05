'use client'

import { useState } from 'react'

export default function AdminBroadcastPage() {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('Special Offer from NextStep')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const handleMessageChange = (val: string) => {
    setMessage(val)
    setCharCount(val.length)
  }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send broadcast')
      }

      setStatus({
        type: 'success',
        text: `Broadcast sent successfully to ${data.count || 'all'} students.`,
      })
      setMessage('')
      setCharCount(0)
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>
            Broadcast Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compose and send email announcements to all registered students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            System Active
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Left — Compose */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
            {/* Compose header */}
            <div className="border-b border-border/40 bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Compose Broadcast</h3>
                  <p className="text-[11px] text-muted-foreground">This message will be emailed to every registered student</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="p-6 space-y-5">
              {/* Subject line */}
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subject Line
                </label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Email subject line..."
                />
              </div>

              {/* Message body */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message Body
                  </label>
                  <span className={`text-[11px] font-medium ${charCount > 1000 ? 'text-amber-600' : 'text-muted-foreground/50'}`}>
                    {charCount} / 2000
                  </span>
                </div>
                <textarea
                  id="message"
                  rows={8}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Write your announcement here...&#10;&#10;e.g., Get 20% off all Premium College Visits this weekend only! Click 'Go to Dashboard' to claim your offer."
                  className="w-full rounded-xl border border-border bg-background p-4 text-sm leading-relaxed resize-none transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Quick templates */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Quick Templates</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'New College Added', text: 'Exciting news! We have added new partner colleges to our platform. Log in to explore the latest options for your admission journey.' },
                    { label: 'Offer / Discount', text: 'Limited time offer! Get special pricing on Premium counselling sessions. Visit your dashboard to learn more.' },
                    { label: 'Event Reminder', text: 'Reminder: We have upcoming campus visit slots available. Book now to secure your preferred dates before they fill up.' },
                  ].map(t => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => { handleMessageChange(t.text); setSubject(t.label + ' — NextStep') }}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-primary"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status feedback */}
              {status && (
                <div
                  className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
                    status.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {status.type === 'success' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  )}
                  <span className="font-semibold">{status.text}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-border/40 pt-5">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="flex items-center gap-2.5 rounded-xl bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right — Info & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Broadcast info */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              How It Works
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                'Your message is sent to every registered student via email.',
                'Emails are dispatched in batches of 50 for reliability.',
                'Students receive it as a branded NextStep notification.',
                'This action cannot be undone — double-check before sending.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground leading-relaxed">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Best Practices
            </h3>
            <ul className="mt-3 space-y-2 text-[12px] text-amber-700 leading-relaxed">
              <li>Keep messages short and action-oriented.</li>
              <li>Avoid sending more than 2 broadcasts per week.</li>
              <li>Include a clear call-to-action for students.</li>
              <li>Test the message preview before sending.</li>
            </ul>
          </div>

          {/* Email preview (toggled) */}
          {showPreview && (
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
              <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Email Preview
              </h3>
              <div className="rounded-xl overflow-hidden border border-border/40 bg-[#3d5c53] shadow-lg">
                {/* Email header */}
                <div className="bg-[#3d5c53] px-5 py-4 text-center border-b border-[#50786d]/30">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold text-white">NextStep</span>
                  </div>
                </div>
                {/* Email body */}
                <div className="bg-[#3d5c53] px-5 py-5">
                  <h4 className="text-center text-base font-bold text-white mb-1">New Notification from NextStep</h4>
                  <p className="text-center text-xs text-white/50 mb-4">You have a new update regarding your college admission journey.</p>
                  <div className="rounded-lg border border-[#50786d] bg-[#2e4a42] p-4">
                    <p className="text-sm text-[#b3cdc5] whitespace-pre-wrap leading-relaxed">{message || 'Your message will appear here...'}</p>
                  </div>
                  <div className="mt-5 text-center">
                    <span className="inline-block rounded-lg bg-[#50786d] px-5 py-2 text-sm font-bold text-white">Go to Dashboard</span>
                  </div>
                </div>
                {/* Email footer */}
                <div className="border-t border-[#50786d]/30 bg-[#3d5c53] px-5 py-3 text-center">
                  <p className="text-[10px] text-white/30">&copy; {new Date().getFullYear()} NextStep. All rights reserved.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
