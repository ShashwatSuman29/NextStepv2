'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Slot {
  id: string
  slot_date: string
  slot_time: string
  max_capacity: number
  booked_count: number
}

interface Booking {
  id: string
  status: string
  booking_type: string
  preferred_date: string
  preferred_time: string
  created_at: string
  meeting_link: string | null
}

const statusConfig: Record<string, { border: string; bg: string; text: string; icon: string; label: string }> = {
  confirmed: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Confirmed',
  },
  completed: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Completed',
  },
  cancelled: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Cancelled',
  },
  pending: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    label: 'Pending',
  },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      setBookings(data.data ?? [])
    } catch {
      // network error — keep existing state
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/bookings/slots')
      const data = await res.json()
      setSlots(data.data ?? [])
    } catch {
      // network error — keep existing state
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchSlots()
    const interval = setInterval(() => { fetchBookings() }, 30000)

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
        body: JSON.stringify({ amount, type: 'counselling' }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "NextStep Premium",
        description: "1-on-1 Expert Counselling",
        order_id: order.id,
        handler: async function (response: any) {
          setMessage('Verifying payment...')
          const verify = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, type: 'counselling' })
          })
          if (verify.ok) {
            setMessage('Payment unlocked! Finalizing your booking...')
            handleBook() // Automatically retry booking now that they have a credit
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

  const handleBook = async () => {
    if (!selectedSlot) return
    setSubmitting(true)
    setMessage('')

    const slot = slots.find(s => s.id === selectedSlot)
    if (!slot) return

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slot_id: selectedSlot,
        preferred_date: slot.slot_date,
        preferred_time: slot.slot_time,
        booking_type: 'free_call',
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setMessageType('success')
      setMessage('Booking created successfully! You will receive a confirmation soon.')
      setShowBooking(false)
      setSelectedSlot('')
      setSelectedDate('')
      fetchBookings()
      fetchSlots()
    } else {
      if (res.status === 402) {
        setMessageType('error')
        setMessage(`Free limit maxed. Triggering premium unlock processing...`)
        handlePayment(data.price)
      } else {
        setMessageType('error')
        setMessage(data.error || 'Failed to create booking')
      }
    }
    setSubmitting(false)
  }

  // Group slots by date
  const slotsByDate: Record<string, Slot[]> = {}
  slots.forEach(s => {
    if (!slotsByDate[s.slot_date]) slotsByDate[s.slot_date] = []
    slotsByDate[s.slot_date].push(s)
  })

  const dateEntries = Object.entries(slotsByDate).slice(0, 7)

  const [todayStr, setTodayStr] = useState('')

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0])
  }, [])

  const formatDate = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })

  const formatDay = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric' })

  const formatWeekday = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })

  const formatMonth = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short' })

  const isToday = (date: string) => date === todayStr

  const selectedDateSlots = selectedDate ? slotsByDate[selectedDate] ?? [] : []

  const activeBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')

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
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                Counselling Sessions
              </h1>
              <p className="mt-0.5 text-sm text-white/50">
                Book a free counselling session with our experts
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowBooking(!showBooking); setSelectedDate(''); setSelectedSlot('') }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
              showBooking
                ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 border border-white/10'
                : 'bg-white text-[#2d6a4f] hover:bg-white/90 shadow-md'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              {showBooking ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              ) : (
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              )}
            </svg>
            {showBooking ? 'Cancel' : 'Book Session'}
          </button>
        </div>
        {/* Quick stats */}
        <div className="relative mt-5 flex items-center gap-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/50">{activeBookings.length} upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-xs text-white/50">{pastBookings.length} past</span>
          </div>
        </div>
      </div>

      {/* Message toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-5 flex items-center gap-3 rounded-2xl border p-4 text-sm ${
              messageType === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${messageType === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d={messageType === 'success' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="flex-1">{message}</p>
            <button onClick={() => setMessage('')} className="shrink-0 opacity-50 hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking form — enhanced */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.02] p-6 shadow-soft">
              {/* Steps indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 ${selectedDate ? 'text-primary' : 'text-foreground'}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${selectedDate ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>1</div>
                  <span className="text-xs font-semibold">Pick Date</span>
                </div>
                <div className="h-px flex-1 bg-border" />
                <div className={`flex items-center gap-2 ${selectedSlot ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${selectedSlot ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <span className="text-xs font-semibold">Pick Time</span>
                </div>
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">3</div>
                  <span className="text-xs font-semibold">Confirm</span>
                </div>
              </div>

              {dateEntries.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">No slots available</p>
                  <p className="mt-1 text-xs text-muted-foreground">Please check back later for new availability.</p>
                </div>
              ) : (
                <>
                  {/* Date picker — horizontal scrollable calendar */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select a Date</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {dateEntries.map(([date, dateSlots]) => {
                        const availableCount = dateSlots.filter(s => s.booked_count < s.max_capacity).length
                        const isSelected = selectedDate === date
                        return (
                          <button
                            key={date}
                            onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
                            className={`group relative flex shrink-0 flex-col items-center rounded-2xl border-2 px-4 py-3 transition-all duration-300 ${
                              isSelected
                                ? 'border-primary bg-primary text-white shadow-md scale-105'
                                : 'border-border bg-card text-foreground hover:border-primary/30 hover:shadow-soft hover:-translate-y-0.5'
                            }`}
                          >
                            {isToday(date) && (
                              <span className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                              }`}>Today</span>
                            )}
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {formatWeekday(date)}
                            </span>
                            <span className={`mt-0.5 text-xl font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                              {formatDay(date)}
                            </span>
                            <span className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {formatMonth(date)}
                            </span>
                            <span className={`mt-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : availableCount > 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-500'
                            }`}>
                              {availableCount} slot{availableCount !== 1 ? 's' : ''}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time slot picker */}
                  <AnimatePresence mode="wait">
                    {selectedDate && (
                      <motion.div
                        key={selectedDate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Available Times — {formatDate(selectedDate)}
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                          {selectedDateSlots.map(slot => {
                            const available = slot.booked_count < slot.max_capacity
                            const isSelected = selectedSlot === slot.id
                            const spotsLeft = slot.max_capacity - slot.booked_count
                            return (
                              <button
                                key={slot.id}
                                disabled={!available}
                                onClick={() => setSelectedSlot(slot.id)}
                                className={`group relative flex flex-col items-center rounded-xl border-2 px-3 py-3 transition-all duration-300 ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                                    : available
                                    ? 'border-border bg-card hover:border-primary/30 hover:shadow-soft'
                                    : 'border-border/30 bg-muted/50 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                  <span className={`text-sm font-bold ${isSelected ? 'text-primary' : available ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {slot.slot_time.slice(0, 5)}
                                  </span>
                                </div>
                                {available && (
                                  <span className={`mt-1 text-[9px] font-medium ${
                                    isSelected ? 'text-primary/70' : spotsLeft <= 2 ? 'text-amber-600' : 'text-muted-foreground'
                                  }`}>
                                    {spotsLeft <= 2 ? `Only ${spotsLeft} left` : `${spotsLeft} spots`}
                                  </span>
                                )}
                                {!available && (
                                  <span className="mt-1 text-[9px] font-medium text-red-400">Full</span>
                                )}
                                {isSelected && (
                                  <motion.div
                                    layoutId="slot-check"
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-md"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                      <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </motion.div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm button */}
                  <AnimatePresence>
                    {selectedSlot && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.03] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatDate(selectedDate)} at {slots.find(s => s.id === selectedSlot)?.slot_time.slice(0, 5)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Free Counselling Call</p>
                          </div>
                        </div>
                        <button
                          onClick={handleBook}
                          disabled={submitting}
                          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
                                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                              </svg>
                              Booking...
                            </span>
                          ) : 'Confirm Booking'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings list */}
      <div className="mt-8">
        {loading ? (
          <div className="mt-4 flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
            </svg>
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">No bookings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Book your first free counselling session to get started.</p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Book Session
            </button>
          </div>
        ) : (
          <>
            {/* Active bookings */}
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Upcoming Sessions
                </h2>
                <div className="mt-4 space-y-3">
                  {activeBookings.map((b, i) => {
                    const cfg = statusConfig[b.status] ?? statusConfig.pending
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group rounded-2xl border ${cfg.border} bg-card p-5 transition-all duration-300 hover:shadow-soft`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={cfg.text}>
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">Free Counselling Call</p>
                              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                  {new Date(b.preferred_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                  {b.preferred_time?.slice(0, 5)}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                Booked on {new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold ${cfg.border} ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Meeting link */}
                        {(b.status === 'confirmed' || b.status === 'completed') && b.meeting_link && (
                          <div className="mt-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-50/50 p-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 shrink-0">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M15 10l5-5m0 0h-4m4 0v4M9 14l-5 5m0 0h4m-4 0v-4" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Meeting Link</p>
                              <a href={b.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-green-700 hover:underline truncate block">
                                {b.meeting_link}
                              </a>
                            </div>
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition-all hover:-translate-y-0.5 shadow-md"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 10l5-5m0 0h-4m4 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                              Join Call
                            </a>
                          </div>
                        )}

                        {b.status === 'confirmed' && !b.meeting_link && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-3 flex items-center gap-3">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600 shrink-0">
                              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <p className="text-xs text-amber-700">
                              <span className="font-semibold">Confirmed!</span> Meeting link will be shared shortly by the counsellor.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Past bookings */}
            {pastBookings.length > 0 && (
              <div className={activeBookings.length > 0 ? 'mt-8' : ''}>
                <h2 className="text-lg font-bold text-foreground">
                  Past Sessions
                </h2>
                <div className="mt-4 space-y-2">
                  {pastBookings.map((b, i) => {
                    const cfg = statusConfig[b.status] ?? statusConfig.pending
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={cfg.text}>
                              <path d={cfg.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Free Counselling Call</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {new Date(b.preferred_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} at {b.preferred_time?.slice(0, 5)}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-xl border px-3 py-1 text-xs font-semibold ${cfg.border} ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
