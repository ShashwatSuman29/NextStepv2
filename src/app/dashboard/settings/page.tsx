'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [activeSection, setActiveSection] = useState('personal')

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.data)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })

    if (res.ok) {
      setMessageType('success')
      setMessage('Profile updated successfully.')
    } else {
      const data = await res.json()
      setMessageType('error')
      setMessage(data.error || 'Failed to update.')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      </div>
    )
  }

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

  const sections = [
    { id: 'personal', label: 'Personal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'academic', label: 'Academic', icon: 'M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { id: 'exams', label: 'Exam Scores', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your profile, academic details, and account preferences.</p>

      {/* Section tabs */}
      <div className="mt-6 flex gap-1 rounded-xl border border-border/60 bg-card p-1 shadow-soft overflow-x-auto">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d={s.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {s.label}
          </button>
        ))}
      </div>

      {profile ? (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-border/60 bg-card p-7 shadow-soft"
        >
          {message && (
            <div className={`mb-5 flex items-center gap-2 rounded-xl border p-4 text-sm ${
              messageType === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                {messageType === 'success' ? (
                  <>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                ) : (
                  <>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </>
                )}
              </svg>
              {message}
            </div>
          )}

          {/* Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Personal Details</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Your basic information and contact details.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Full Name</label>
                <input type="text" value={(profile.full_name as string) || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Phone Number</label>
                  <input type="tel" value={(profile.phone as string) || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} placeholder="+91 XXXXXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Date of Birth</label>
                  <input type="date" value={(profile.date_of_birth as string) || ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Gender</label>
                <select value={(profile.gender as string) || ''} onChange={(e) => setProfile({ ...profile, gender: e.target.value || null })} className={inputClass}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">City</label>
                  <input type="text" value={(profile.city as string) || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">State</label>
                  <select value={(profile.state as string) || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className={inputClass}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Address</label>
                <textarea value={(profile.address as string) || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={`${inputClass} resize-none`} rows={2} placeholder="Full postal address" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Pincode</label>
                  <input type="text" value={(profile.pincode as string) || ''} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} className={inputClass} placeholder="e.g. 400001" />
                </div>
              </div>

              <div className="border-t border-border/40 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Parent / Guardian Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Parent Name</label>
                    <input type="text" value={(profile.parent_name as string) || ''} onChange={(e) => setProfile({ ...profile, parent_name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Parent Phone</label>
                    <input type="tel" value={(profile.parent_phone as string) || ''} onChange={(e) => setProfile({ ...profile, parent_phone: e.target.value })} className={inputClass} placeholder="+91 XXXXXXXXXX" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information */}
          {activeSection === 'academic' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Academic Records</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Your school and board examination details.</p>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Class 10th</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Marks (%)</label>
                    <input type="number" step="0.01" min="0" max="100" value={(profile.marks_10th as number) ?? ''} onChange={(e) => setProfile({ ...profile, marks_10th: e.target.value ? parseFloat(e.target.value) : null })} className={inputClass} placeholder="e.g. 92.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Board</label>
                    <input type="text" value={(profile.board_10th as string) || ''} onChange={(e) => setProfile({ ...profile, board_10th: e.target.value })} className={inputClass} placeholder="e.g. CBSE, ICSE, State Board" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Class 12th</h3>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-accent/50 p-3 mb-3">
                  <input type="checkbox" id="appearing_12th" checked={(profile.appearing_12th as boolean) || false} onChange={(e) => setProfile({ ...profile, appearing_12th: e.target.checked })} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                  <label htmlFor="appearing_12th" className="text-sm text-foreground">Currently appearing for 12th</label>
                </div>
                {!(profile.appearing_12th as boolean) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Marks (%)</label>
                      <input type="number" step="0.01" min="0" max="100" value={(profile.marks_12th as number) ?? ''} onChange={(e) => setProfile({ ...profile, marks_12th: e.target.value ? parseFloat(e.target.value) : null })} className={inputClass} placeholder="e.g. 88.0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground">Board</label>
                      <input type="text" value={(profile.board_12th as string) || ''} onChange={(e) => setProfile({ ...profile, board_12th: e.target.value })} className={inputClass} placeholder="e.g. CBSE, ICSE, State Board" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exam Scores */}
          {activeSection === 'exams' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Entrance Exam Scores</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Your competitive exam scores help us suggest better colleges.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">JEE Main</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Rank</label>
                    <input type="number" min="1" value={(profile.jee_rank as number) ?? ''} onChange={(e) => setProfile({ ...profile, jee_rank: e.target.value ? parseInt(e.target.value) : null })} className={inputClass} placeholder="e.g. 15000" />
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">MHT-CET</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Percentile/Score</label>
                    <input type="number" min="0" step="0.01" value={(profile.mht_cet_score as number) ?? ''} onChange={(e) => setProfile({ ...profile, mht_cet_score: e.target.value ? parseFloat(e.target.value) : null })} className={inputClass} placeholder="e.g. 95.5" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-3">
                <h3 className="text-sm font-bold text-foreground">Other Exam</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Exam Name</label>
                    <input type="text" value={(profile.other_exam_name as string) || ''} onChange={(e) => setProfile({ ...profile, other_exam_name: e.target.value })} className={inputClass} placeholder="e.g. BITSAT, VITEEE" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Score</label>
                    <input type="number" min="0" step="0.01" value={(profile.other_exam_score as number) ?? ''} onChange={(e) => setProfile({ ...profile, other_exam_score: e.target.value ? parseFloat(e.target.value) : null })} className={inputClass} placeholder="e.g. 280" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeSection === 'preferences' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>Course & Budget Preferences</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Help us find the best college match for you.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">Stream</label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  {(['UG', 'PG'] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setProfile({ ...profile, stream: s })}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        (profile.stream as string) === s
                          ? 'border-primary bg-primary-light text-primary shadow-sm'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {s === 'UG' ? 'Undergraduate (UG)' : 'Postgraduate (PG)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Desired Course</label>
                  <input type="text" value={(profile.desired_course as string) || ''} onChange={(e) => setProfile({ ...profile, desired_course: e.target.value })} className={inputClass} placeholder="e.g. B.Tech, BBA, MBA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground">Desired Branch</label>
                  <input type="text" value={(profile.desired_branch as string) || ''} onChange={(e) => setProfile({ ...profile, desired_branch: e.target.value })} className={inputClass} placeholder="e.g. Computer Science" />
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Budget Range (INR/year)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground">Minimum</label>
                    <input type="number" min="0" value={(profile.budget_min as number) ?? ''} onChange={(e) => setProfile({ ...profile, budget_min: e.target.value ? parseInt(e.target.value) : null })} className={inputClass} placeholder="e.g. 50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground">Maximum</label>
                    <input type="number" min="0" value={(profile.budget_max as number) ?? ''} onChange={(e) => setProfile({ ...profile, budget_max: e.target.value ? parseInt(e.target.value) : null })} className={inputClass} placeholder="e.g. 300000" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">No profile found.</p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-2xl border border-border/60 bg-card p-7 shadow-soft"
      >
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
          Account
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Manage your account settings.</p>
        <div className="mt-5 rounded-xl border border-red-200/50 bg-red-50/30 p-4">
          <p className="text-sm font-medium text-foreground">Sign out of your account</p>
          <p className="mt-0.5 text-xs text-muted-foreground">You will need to sign in again to access your dashboard.</p>
          <button
            onClick={handleLogout}
            className="mt-3 rounded-xl border border-destructive/30 bg-white px-5 py-2 text-sm font-semibold text-destructive transition-all duration-300 hover:bg-red-50 hover:border-destructive/50"
          >
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
