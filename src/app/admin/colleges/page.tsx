'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'

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

  // CSV State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

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
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    setSaving(true)
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
      setShowForm(false)
      resetForm()
      fetchColleges()
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

  // Handle CSV Bulk Upload
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCsv(true)
    setUploadStatus('Parsing CSV...')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        const rows = results.data as any[]
        setUploadStatus(`Uploading ${rows.length} colleges...`)
        let successCount = 0
        let failCount = 0

        for (const row of rows) {
          try {
            if (!row.name || !row.city || !row.state) {
              failCount++
              continue
            }
            const payload = {
              name: row.name,
              city: row.city,
              state: row.state,
              college_type: row.college_type || 'private',
              description: row.description || '',
              fee_min: row.fee_min ? Number(row.fee_min) : null,
              fee_max: row.fee_max ? Number(row.fee_max) : null,
              established_year: row.established_year ? Number(row.established_year) : null,
              status: row.status || 'active',
              daily_visit_capacity: row.daily_visit_capacity ? Number(row.daily_visit_capacity) : 5,
              placement_rate: row.placement_rate ? Number(row.placement_rate) : null,
            }
            const res = await fetch('/api/admin/colleges', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (res.ok) successCount++
            else failCount++
          } catch (err) {
            failCount++
          }
        }
        setUploadStatus(`Done! Added: ${successCount}, Failed: ${failCount}`)
        setUploadingCsv(false)
        fetchColleges()
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
      error: () => {
        setUploadStatus('Error parsing CSV file.')
        setUploadingCsv(false)
      }
    })
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
          <div className="relative w-full sm:w-auto">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCsvUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCsv}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 4L12 16M12 4L8 8M12 4L16 8M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Bulk Import CSV
            </button>
          </div>
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
        {uploadStatus && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {uploadingCsv && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>}
            {uploadStatus}
            {!uploadingCsv && <button onClick={() => setUploadStatus(null)} className="ml-auto text-blue-500 hover:text-blue-800">Dismiss</button>}
          </motion.div>
        )}
      </AnimatePresence>

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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5 disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update College' : 'Create College'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm() }} className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent transition-colors">
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
                  Fee: <span className="font-semibold text-foreground">₹{c.fee_min?.toLocaleString('en-IN') ?? '—'} – ₹{c.fee_max?.toLocaleString('en-IN') ?? '—'}</span>/yr
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
