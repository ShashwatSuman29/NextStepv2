'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface College {
  id: string
  name: string
  city: string
  state: string
  status: string
  is_deleted: boolean
  is_featured: boolean
  fee_min: number | null
  fee_max: number | null
  college_type: string
  placement_rate: number | null
  established_year: number | null
  accreditation: string | null
  description: string | null
  website: string | null
  ranking: string | null
  campus_size: string | null
  avg_package: number | null
  highest_package: number | null
  facilities: string[]
  hostel_available: boolean
  scholarship: boolean
  daily_visit_capacity: number
  image_paths: string[]
}

interface CourseEntry {
  id?: string
  course_name: string
  branch: string
  stream: 'UG' | 'PG'
  duration_years: string | number
  annual_fee: string | number
  eligibility: string
  exams_accepted: string[]
}

const COMMON_EXAMS = [
  'JEE Main', 'JEE Advanced', 'MHT-CET', 'NEET', 'CAT', 'MAT',
  'GATE', 'CLAT', 'CUET', 'BITSAT', 'VITEEE', 'COMEDK',
]

const EMPTY_COURSE: CourseEntry = {
  course_name: '', branch: '', stream: 'UG', duration_years: '',
  annual_fee: '', eligibility: '', exams_accepted: [],
}

const FACILITIES_OPTIONS = [
  'Library', 'Gymnasium', 'Swimming Pool', 'Cafeteria', 'Auditorium',
  'Computer Lab', 'Sports Ground', 'Wi-Fi Campus', 'Medical Center',
  'Research Lab', 'Workshop', 'Seminar Hall', 'Indoor Stadium',
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', state: '', description: '',
    status: 'inactive', daily_visit_capacity: 5, is_featured: false,
    fee_min: '' as string | number, fee_max: '' as string | number,
    established_year: '' as string | number,
    website: '', accreditation: '', ranking: '', campus_size: '',
    placement_rate: '' as string | number,
    avg_package: '' as string | number,
    highest_package: '' as string | number,
    facilities: [] as string[],
    hostel_available: false, scholarship: false,
    college_type: 'private',
    image_paths: [] as string[],
  })
  const [imageUrlInput, setImageUrlInput] = useState('')

  const fetchColleges = async () => {
    const res = await fetch('/api/admin/colleges')
    const data = await res.json()
    setColleges(data.data ?? [])
    setLoading(false)
  }

  // eslint-disable-next-line
  useEffect(() => { fetchColleges() }, [])

  const resetForm = () => {
    setForm({
      name: '', city: '', state: '', description: '',
      status: 'inactive', daily_visit_capacity: 5, is_featured: false,
      fee_min: '', fee_max: '', established_year: '',
      website: '', accreditation: '', ranking: '', campus_size: '',
      placement_rate: '', avg_package: '', highest_package: '',
      facilities: [], hostel_available: false, scholarship: false,
      college_type: 'private', image_paths: [],
    })
    setImageUrlInput('')
    setEditingId(null)
    setCourses([])
    setExistingCourses([])
    setShowAddCourse(false)
    setNewCourse({ ...EMPTY_COURSE })
  }

  const handleEdit = (college: College) => {
    setForm({
      name: college.name,
      city: college.city,
      state: college.state,
      description: college.description ?? '',
      status: college.status,
      daily_visit_capacity: college.daily_visit_capacity ?? 5,
      is_featured: college.is_featured,
      fee_min: college.fee_min ?? '',
      fee_max: college.fee_max ?? '',
      established_year: college.established_year ?? '',
      website: college.website ?? '',
      accreditation: college.accreditation ?? '',
      ranking: college.ranking ?? '',
      campus_size: college.campus_size ?? '',
      placement_rate: college.placement_rate ?? '',
      avg_package: college.avg_package ?? '',
      highest_package: college.highest_package ?? '',
      facilities: college.facilities ?? [],
      hostel_available: college.hostel_available ?? false,
      scholarship: college.scholarship ?? false,
      college_type: college.college_type ?? 'private',
      image_paths: college.image_paths ?? [],
    })
    setEditingId(college.id)
    setCourses([])
    fetchCoursesForCollege(college.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const payload: Record<string, unknown> = { ...form }
    payload.fee_min = form.fee_min === '' ? null : Number(form.fee_min)
    payload.fee_max = form.fee_max === '' ? null : Number(form.fee_max)
    payload.established_year = form.established_year === '' ? null : Number(form.established_year)
    payload.placement_rate = form.placement_rate === '' ? null : Number(form.placement_rate)
    payload.avg_package = form.avg_package === '' ? null : Number(form.avg_package)
    payload.highest_package = form.highest_package === '' ? null : Number(form.highest_package)

    const isEdit = !!editingId
    const url = isEdit ? `/api/admin/colleges/${editingId}` : '/api/admin/colleges'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const savedCollege = await res.json()
      const collegeId = editingId ?? savedCollege?.data?.id

      // Save any new courses added inline
      if (collegeId && courses.length > 0) {
        for (const c of courses) {
          await fetch('/api/admin/streams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              college_id: collegeId,
              course_name: c.course_name,
              branch: c.branch || null,
              stream: c.stream,
              duration_years: c.duration_years === '' ? null : Number(c.duration_years),
              annual_fee: c.annual_fee === '' ? null : Number(c.annual_fee),
              eligibility: c.eligibility || null,
              exams_accepted: c.exams_accepted,
            }),
          })
        }
      }

      setShowForm(false)
      resetForm()
      fetchColleges()
    } else {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error || 'Failed to save college. Please check required fields.')
    }
    setSaving(false)
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setColleges(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    const res = await fetch(`/api/admin/colleges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      setColleges(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus } : c))
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteError(null)
    const prev = colleges
    setColleges(colleges.filter(c => c.id !== id))
    setConfirmDeleteId(null)
    const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setColleges(prev)
      const data = await res.json()
      setDeleteError(data.error || 'Failed to delete college')
    }
  }

  const toggleFacility = (f: string) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter(x => x !== f)
        : [...prev.facilities, f],
    }))
  }

  const addImageUrl = () => {
    const url = imageUrlInput.trim()
    if (url && !form.image_paths.includes(url)) {
      setForm(prev => ({ ...prev, image_paths: [...prev.image_paths, url] }))
      setImageUrlInput('')
    }
  }

  const removeImageUrl = (url: string) => {
    setForm(prev => ({ ...prev, image_paths: prev.image_paths.filter(u => u !== url) }))
  }

  const inputClass = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  const labelClass = 'mb-1 block text-xs font-semibold text-muted-foreground tracking-wide uppercase'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-sans)' }}>College Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, and manage colleges on the platform.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
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
                Add College
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-6">
              <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>
                {editingId ? 'Edit College' : 'New College'}
              </h3>

              {/* Basic Info */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Basic Information
                </h4>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="College name *" className={inputClass} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="City *" className={inputClass} />
                  <select value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className={inputClass}>
                    <option value="">Select State *</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>College Type</label>
                    <select value={form.college_type} onChange={(e) => setForm({...form, college_type: e.target.value})} className={inputClass}>
                      <option value="private">Private</option>
                      <option value="government">Government</option>
                      <option value="deemed">Deemed</option>
                      <option value="autonomous">Autonomous</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Established Year</label>
                    <input type="number" min={1800} max={2030} value={form.established_year} onChange={(e) => setForm({...form, established_year: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 1990" className={inputClass} />
                  </div>
                </div>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="College description — highlight key features, history, and achievements..." className={`${inputClass} resize-none`} rows={4} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Website URL</label>
                    <input value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://www.college.edu" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Campus Size</label>
                    <input value={form.campus_size} onChange={(e) => setForm({...form, campus_size: e.target.value})} placeholder="e.g. 50 Acres" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Accreditation & Rankings */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 15l-2 5-1-1-5 1 1-5-1-1 5-2 1-1 1-5 1 5 1 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Accreditation & Rankings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Accreditation</label>
                    <input value={form.accreditation} onChange={(e) => setForm({...form, accreditation: e.target.value})} placeholder="e.g. NAAC A+, NBA" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Ranking</label>
                    <input value={form.ranking} onChange={(e) => setForm({...form, ranking: e.target.value})} placeholder="e.g. NIRF #25" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Fees & Placement */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">₹</span>
                  Fees & Placement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Min Fee (INR/year)</label>
                    <input type="number" min={0} value={form.fee_min} onChange={(e) => setForm({...form, fee_min: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 50000" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Max Fee (INR/year)</label>
                    <input type="number" min={0} value={form.fee_max} onChange={(e) => setForm({...form, fee_max: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 200000" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Placement Rate (%)</label>
                    <input type="number" min={0} max={100} step={0.1} value={form.placement_rate} onChange={(e) => setForm({...form, placement_rate: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 92" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Avg Package (LPA)</label>
                    <input type="number" min={0} step={0.1} value={form.avg_package} onChange={(e) => setForm({...form, avg_package: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 8.5" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Highest Package (LPA)</label>
                    <input type="number" min={0} step={0.1} value={form.highest_package} onChange={(e) => setForm({...form, highest_package: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 45" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Facilities & Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {FACILITIES_OPTIONS.map(f => (
                    <button key={f} type="button" onClick={() => toggleFacility(f)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                        form.facilities.includes(f)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                      }`}
                    >{f}</button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.hostel_available} onChange={(e) => setForm({...form, hostel_available: e.target.checked})} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    Hostel Available
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.scholarship} onChange={(e) => setForm({...form, scholarship: e.target.checked})} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    Scholarship Available
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({...form, is_featured: e.target.checked})} className="h-4 w-4 rounded border-border text-primary accent-primary" />
                    Featured College
                  </label>
                </div>
              </div>

              {/* Streams Offered */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Streams & Courses Offered
                  </h4>
                  <button type="button" onClick={() => setShowAddCourse(!showAddCourse)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                    {showAddCourse ? (
                      <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Cancel</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>Add Course</>
                    )}
                  </button>
                </div>

                {/* Existing courses (when editing) */}
                {existingCourses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Existing Courses</p>
                    {existingCourses.map(c => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-4 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                            c.stream === 'UG' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-purple-200 bg-purple-50 text-purple-700'
                          }`}>{c.stream}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{c.course_name}</span>
                          {c.branch && <span className="text-xs text-muted-foreground">— {c.branch}</span>}
                          {c.annual_fee && <span className="text-[10px] text-muted-foreground ml-2">₹{Number(c.annual_fee).toLocaleString('en-IN')}/yr</span>}
                        </div>
                        <button type="button" onClick={() => c.id && deleteExistingCourse(c.id)}
                          className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium text-destructive hover:bg-red-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly added courses (not yet saved) */}
                {courses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">New Courses (will be saved with college)</p>
                    {courses.map((c, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/[0.03] px-4 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                            c.stream === 'UG' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-purple-200 bg-purple-50 text-purple-700'
                          }`}>{c.stream}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{c.course_name}</span>
                          {c.branch && <span className="text-xs text-muted-foreground">— {c.branch}</span>}
                          {c.annual_fee && <span className="text-[10px] text-muted-foreground ml-2">₹{Number(c.annual_fee).toLocaleString('en-IN')}/yr</span>}
                        </div>
                        <button type="button" onClick={() => removeNewCourse(i)}
                          className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium text-destructive hover:bg-red-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add course inline form */}
                {showAddCourse && (
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Course Name *</label>
                        <input value={newCourse.course_name} onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})} placeholder="e.g. B.Tech, MBA" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Branch</label>
                        <input value={newCourse.branch} onChange={(e) => setNewCourse({...newCourse, branch: e.target.value})} placeholder="e.g. Computer Science" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Stream *</label>
                        <select value={newCourse.stream} onChange={(e) => setNewCourse({...newCourse, stream: e.target.value as 'UG' | 'PG'})} className={inputClass}>
                          <option value="UG">UG (Undergraduate)</option>
                          <option value="PG">PG (Postgraduate)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Duration (Years)</label>
                        <input type="number" min={1} max={6} value={newCourse.duration_years} onChange={(e) => setNewCourse({...newCourse, duration_years: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 4" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Annual Fee (INR)</label>
                        <input type="number" min={0} value={newCourse.annual_fee} onChange={(e) => setNewCourse({...newCourse, annual_fee: e.target.value === '' ? '' : Number(e.target.value)})} placeholder="e.g. 150000" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Eligibility</label>
                      <input value={newCourse.eligibility} onChange={(e) => setNewCourse({...newCourse, eligibility: e.target.value})} placeholder="e.g. 10+2 with PCM, min 60%" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Exams Accepted</label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {COMMON_EXAMS.map(exam => (
                          <button key={exam} type="button" onClick={() => toggleNewCourseExam(exam)}
                            className={`rounded-md border px-2.5 py-1 text-[10px] font-medium transition-all ${
                              newCourse.exams_accepted.includes(exam)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                            }`}
                          >{exam}</button>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={addNewCourse} disabled={!newCourse.course_name}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50">
                      Add to List
                    </button>
                  </div>
                )}

                {existingCourses.length === 0 && courses.length === 0 && !showAddCourse && (
                  <p className="text-xs text-muted-foreground/60">No courses added yet. Click &quot;Add Course&quot; to add streams offered by this college.</p>
                )}
              </div>

              {/* Campus Photos */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Campus Photos
                </h4>
                <div className="flex gap-2">
                  <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="Paste image URL (campus, library, facilities...)" className={`${inputClass} flex-1`}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
                  />
                  <button type="button" onClick={addImageUrl} className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors">Add</button>
                </div>
                {form.image_paths.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.image_paths.map((url, i) => (
                      <div key={i} className="group relative h-20 w-28 overflow-hidden rounded-lg border border-border bg-muted">
                        <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '' }} />
                        <button type="button" onClick={() => removeImageUrl(url)} className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">Add photos of campus, playground, library, labs, hostel, etc.</p>
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 flex items-center justify-between">
                  <span>{saveError}</span>
                  <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">Dismiss</button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update College' : 'Create College'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm(); setSaveError(null) }} className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {deleteError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-500 hover:text-red-700 text-xs font-medium">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-muted-foreground">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
          </svg>
          Loading...
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-lifted"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-sans)' }}>{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.city}, {c.state}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    c.status === 'active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}>{c.status}</span>
                  {c.is_featured && (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-secondary">
                      <path d="M8 1.333l2.06 4.174 4.607.67-3.334 3.25.787 4.586L8 11.847l-4.12 2.166.787-4.586L1.333 6.177l4.607-.67L8 1.333z"/>
                    </svg>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.college_type && (
                  <span className="rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">{c.college_type}</span>
                )}
                {c.established_year && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Est. {c.established_year}</span>
                )}
                {c.placement_rate != null && (
                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">{c.placement_rate}% placement</span>
                )}
                {c.accreditation && (
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{c.accreditation}</span>
                )}
              </div>

              {(c.fee_min || c.fee_max) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Fee: <span className="font-semibold text-foreground"><span className="text-primary">₹</span>{c.fee_min?.toLocaleString('en-IN') ?? '—'} – <span className="text-primary">₹</span>{c.fee_max?.toLocaleString('en-IN') ?? '—'}</span>/yr
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
                {confirmDeleteId === c.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-red-700">Permanently delete?</span>
                    <button onClick={() => handleDelete(c.id)} className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-destructive/90 transition-colors">Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-background transition-colors">No</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleEdit(c)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Edit
                    </button>
                    <button onClick={() => handleToggleStatus(c.id, c.status)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                      {c.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => setConfirmDeleteId(c.id)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-destructive hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
          {colleges.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No colleges yet. Add your first college above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
