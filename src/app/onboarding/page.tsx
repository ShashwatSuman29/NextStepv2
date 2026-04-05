'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

const STEPS = [
  { number: 1, title: 'Personal', desc: 'Your basic information' },
  { number: 2, title: 'Academic', desc: 'Your academic records' },
  { number: 3, title: 'Preferences', desc: 'Your course goals' },
]

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 80 : -80, opacity: 0 }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    state: '',
    marks_10th: '',
    marks_12th: '',
    appearing_12th: false,
    jee_rank: '',
    desired_course: '',
    desired_branch: '',
    stream: 'UG' as 'UG' | 'PG',
  })

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      city: form.city,
      state: form.state,
      marks_10th: parseFloat(form.marks_10th),
      marks_12th: parseFloat(form.marks_12th),
      appearing_12th: form.appearing_12th,
      jee_rank: parseInt(form.jee_rank),
      desired_course: form.desired_course,
      desired_branch: form.desired_branch || null,
      stream: form.stream,
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          const patchRes = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const patchData = await patchRes.json()
          if (!patchRes.ok) {
            setError(patchData.error || 'Failed to update profile')
            return
          }
        } else {
          setError(data.error || 'Failed to save profile')
          return
        }
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-border bg-card px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const selectClass =
    'mt-1.5 block w-full rounded-xl border border-border bg-card px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      {/* Top bar */}
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">N</span>
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-serif)' }}>
              NextStep
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">Step {step} of 3</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
                        s.number < step
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : s.number === step
                          ? 'bg-primary text-primary-foreground shadow-md animate-pulse-glow'
                          : 'border-2 border-border bg-card text-muted-foreground'
                      }`}
                    >
                      {s.number < step ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8l3 3 5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        s.number
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-foreground">{s.title}</span>
                    <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1.5 sm:mx-3 mb-8 h-0.5 w-8 sm:w-16 md:w-24 rounded-full transition-colors duration-500 ${
                      s.number < step ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border/60 bg-card p-7 shadow-lifted">
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                      Personal Information
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Tell us a bit about yourself.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                    <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Phone Number <span className="text-destructive">*</span></label>
                    <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/[^0-9+]/g, ''))} className={inputClass} placeholder="e.g., 9876543210" maxLength={15} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">City <span className="text-destructive">*</span></label>
                      <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} placeholder="e.g., Mumbai" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">State <span className="text-destructive">*</span></label>
                      <select value={form.state} onChange={(e) => update('state', e.target.value)} className={selectClass}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.full_name || !form.phone || !form.city || !form.state) { setError('Please fill in all required fields'); return }
                      if (form.phone.replace(/\D/g, '').length < 10) { setError('Phone number must be at least 10 digits'); return }
                      setError(''); goTo(2)
                    }}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Step 2: Academic Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                      Academic Information
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Your academic background helps us find the best fit.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">10th Marks (%) <span className="text-destructive">*</span></label>
                    <input type="number" step="0.01" min="0" max="100" value={form.marks_10th} onChange={(e) => update('marks_10th', e.target.value)} className={inputClass} placeholder="e.g., 92.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">12th Marks (%) <span className="text-destructive">*</span></label>
                    <div className="flex items-center gap-3 mt-1">
                      <input type="checkbox" id="appearing_12th" checked={form.appearing_12th} onChange={(e) => update('appearing_12th', e.target.checked)} className="h-4 w-4 rounded border-border text-primary accent-primary shrink-0" />
                      <label htmlFor="appearing_12th" className="text-xs text-muted-foreground">Currently appearing for 12th</label>
                    </div>
                    <input type="number" step="0.01" min="0" max="100" value={form.marks_12th} onChange={(e) => update('marks_12th', e.target.value)} className={inputClass} placeholder={form.appearing_12th ? 'Enter expected marks' : 'e.g., 88.0'} />
                    {form.appearing_12th && (
                      <p className="mt-1 text-[10px] text-muted-foreground">Enter your expected/predicted marks</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">JEE Rank <span className="text-destructive">*</span></label>
                    <input type="number" min="1" value={form.jee_rank} onChange={(e) => update('jee_rank', e.target.value)} className={inputClass} placeholder="e.g., 15000" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => goTo(1)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.marks_10th) { setError('10th marks are required'); return }
                        if (!form.marks_12th) { setError('12th marks are required'); return }
                        if (!form.jee_rank) { setError('JEE rank is required'); return }
                        setError(''); goTo(3)
                      }}
                      className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Course Preferences */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                      Course Preferences
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">What are you looking to study?</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Stream <span className="text-destructive">*</span></label>
                    <div className="mt-1.5 grid grid-cols-2 gap-3">
                      {(['UG', 'PG'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => update('stream', s)}
                          className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            form.stream === s
                              ? 'border-primary bg-primary-light text-primary shadow-sm'
                              : 'border-border text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          {s === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Desired Course <span className="text-destructive">*</span></label>
                    <input type="text" value={form.desired_course} onChange={(e) => update('desired_course', e.target.value)} className={inputClass} placeholder="e.g., B.Tech, BBA, MBA" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Desired Branch <span className="text-muted-foreground text-xs">(optional)</span></label>
                    <input type="text" value={form.desired_branch} onChange={(e) => update('desired_branch', e.target.value)} className={inputClass} placeholder="e.g., Computer Science, Mechanical" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => goTo(2)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-accent">
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!form.desired_course) { setError('Desired course is required'); return }
                        setError(''); handleSubmit()
                      }}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Complete Profile'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
