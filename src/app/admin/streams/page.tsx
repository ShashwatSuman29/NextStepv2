'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollegeOption {
  id: string
  name: string
}

interface Stream {
  id: string
  college_id: string
  course_name: string
  branch: string | null
  stream: 'UG' | 'PG'
  duration_years: number | null
  annual_fee: number | null
  eligibility: string | null
  exams_accepted: string[]
  created_at: string
  colleges: { id: string; name: string } | null
}

const COMMON_EXAMS = [
  'JEE Main', 'JEE Advanced', 'MHT-CET', 'NEET', 'CAT', 'MAT',
  'GATE', 'CLAT', 'CUET', 'BITSAT', 'VITEEE', 'COMEDK',
]

export default function AdminStreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [colleges, setColleges] = useState<CollegeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filterCollege, setFilterCollege] = useState('')
  const [filterStream, setFilterStream] = useState<'' | 'UG' | 'PG'>('')

  const [form, setForm] = useState({
    college_id: '',
    course_name: '',
    branch: '',
    stream: 'UG' as 'UG' | 'PG',
    duration_years: '' as string | number,
    annual_fee: '' as string | number,
    eligibility: '',
    exams_accepted: [] as string[],
  })

  const fetchStreams = async () => {
    const res = await fetch('/api/admin/streams')
    const data = await res.json()
    setStreams(data.data ?? [])
    setLoading(false)
  }

  const fetchColleges = async () => {
    const res = await fetch('/api/admin/colleges')
    const data = await res.json()
    setColleges((data.data ?? []).map((c: any) => ({ id: c.id, name: c.name })))
  }

  useEffect(() => {
    fetchStreams()
    fetchColleges()
  }, [])

  const resetForm = () => {
    setForm({
      college_id: '',
      course_name: '',
      branch: '',
      stream: 'UG',
      duration_years: '',
      annual_fee: '',
      eligibility: '',
      exams_accepted: [],
    })
    setEditingId(null)
  }

  const handleEdit = (s: Stream) => {
    setForm({
      college_id: s.college_id,
      course_name: s.course_name,
      branch: s.branch ?? '',
      stream: s.stream,
      duration_years: s.duration_years ?? '',
      annual_fee: s.annual_fee ?? '',
      eligibility: s.eligibility ?? '',
      exams_accepted: s.exams_accepted ?? [],
    })
    setEditingId(s.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!form.college_id || !form.course_name) return
    setSaving(true)

    const payload: Record<string, unknown> = {
      ...form,
      duration_years: form.duration_years === '' ? null : Number(form.duration_years),
      annual_fee: form.annual_fee === '' ? null : Number(form.annual_fee),
      branch: form.branch || null,
      eligibility: form.eligibility || null,
    }

    const isEdit = !!editingId
    const url = isEdit ? `/api/admin/streams/${editingId}` : '/api/admin/streams'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowForm(false)
      resetForm()
      fetchStreams()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null)
    const prev = streams
    setStreams(streams.filter(s => s.id !== id))
    const res = await fetch(`/api/admin/streams/${id}`, { method: 'DELETE' })
    if (!res.ok) setStreams(prev)
  }

  const toggleExam = (exam: string) => {
    setForm(prev => ({
      ...prev,
      exams_accepted: prev.exams_accepted.includes(exam)
        ? prev.exams_accepted.filter(e => e !== exam)
        : [...prev.exams_accepted, exam],
    }))
  }

  const filtered = streams.filter(s => {
    if (filterCollege && s.college_id !== filterCollege) return false
    if (filterStream && s.stream !== filterStream) return false
    return true
  })

  const inputClass = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'mb-1 block text-xs font-semibold text-muted-foreground tracking-wide uppercase'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>
            Stream & Course Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and manage courses/streams offered by each college.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
            showForm
              ? 'border border-border bg-card text-foreground hover:bg-accent'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {showForm ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Add Stream
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-5">
              <h3 className="text-lg font-bold text-foreground">
                {editingId ? 'Edit Stream/Course' : 'New Stream/Course'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>College *</label>
                  <select value={form.college_id} onChange={(e) => setForm({...form, college_id: e.target.value})} className={inputClass}>
                    <option value="">Select College</option>
                    {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Stream *</label>
                  <select value={form.stream} onChange={(e) => setForm({...form, stream: e.target.value as 'UG' | 'PG'})} className={inputClass}>
                    <option value="UG">UG (Undergraduate)</option>
                    <option value="PG">PG (Postgraduate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Course Name *</label>
                  <input value={form.course_name} onChange={(e) => setForm({...form, course_name: e.target.value})} placeholder="e.g. B.Tech, MBA, B.Pharm" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Branch / Specialization</label>
                  <input value={form.branch} onChange={(e) => setForm({...form, branch: e.target.value})} placeholder="e.g. Computer Science, Marketing" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Duration (Years)</label>
                  <input type="number" min={1} max={6} value={form.duration_years} onChange={(e) => setForm({...form, duration_years: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 4" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Annual Fee (INR)</label>
                  <input type="number" min={0} value={form.annual_fee} onChange={(e) => setForm({...form, annual_fee: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 150000" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Eligibility</label>
                <textarea value={form.eligibility} onChange={(e) => setForm({...form, eligibility: e.target.value})} placeholder="e.g. 10+2 with PCM, minimum 60% aggregate" className={`${inputClass} resize-none`} rows={2} />
              </div>

              <div>
                <label className={labelClass}>Exams Accepted</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {COMMON_EXAMS.map(exam => (
                    <button key={exam} type="button" onClick={() => toggleExam(exam)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        form.exams_accepted.includes(exam)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                      }`}
                    >{exam}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !form.college_id || !form.course_name} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update Stream' : 'Create Stream'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm() }} className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground">
          <option value="">All Colleges</option>
          {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStream} onChange={(e) => setFilterStream(e.target.value as '' | 'UG' | 'PG')} className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground">
          <option value="">All Streams</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
        </select>
        <span className="text-xs text-muted-foreground">{filtered.length} stream{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">College</th>
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch</th>
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stream</th>
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</th>
                <th className="pb-3 pr-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fee/yr</th>
                <th className="pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 pr-4 font-medium text-foreground max-w-[160px] truncate">
                    {s.colleges?.name ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-foreground">{s.course_name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.branch || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                      s.stream === 'UG' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-purple-200 bg-purple-50 text-purple-700'
                    }`}>{s.stream}</span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.duration_years ? `${s.duration_years} yr` : '—'}</td>
                  <td className="py-3 pr-4 text-foreground">{s.annual_fee ? `₹${s.annual_fee.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="py-3">
                    {confirmDeleteId === s.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDelete(s.id)} className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-destructive/90">Yes</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-background">No</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(s)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors">Edit</button>
                        <button onClick={() => setConfirmDeleteId(s.id)} className="rounded-lg px-2.5 py-1 text-xs font-medium text-destructive hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    {streams.length === 0 ? 'No streams/courses yet. Add your first one above.' : 'No streams match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
