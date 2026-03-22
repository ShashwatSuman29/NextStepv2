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
}

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', city: '', state: '', description: '',
    status: 'inactive', daily_visit_capacity: 5, is_featured: false,
    fee_min: '' as string | number, fee_max: '' as string | number,
  })

  const fetchColleges = async () => {
    const res = await fetch('/api/admin/colleges')
    const data = await res.json()
    setColleges(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchColleges() }, [])

  const handleCreate = async () => {
    const payload: Record<string, unknown> = { ...form }
    // Convert fee fields: empty string -> null, otherwise number
    payload.fee_min = form.fee_min === '' ? null : Number(form.fee_min)
    payload.fee_max = form.fee_max === '' ? null : Number(form.fee_max)

    const res = await fetch('/api/admin/colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', city: '', state: '', description: '', status: 'inactive', daily_visit_capacity: 5, is_featured: false, fee_min: '', fee_max: '' })
      fetchColleges()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    // Optimistic update
    setColleges(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    const res = await fetch(`/api/admin/colleges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      // Revert on failure
      setColleges(prev => prev.map(c => c.id === id ? { ...c, status: currentStatus } : c))
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteError(null)
    // Optimistic update: mark as deleted immediately
    setColleges(prev => prev.map(c => c.id === id ? { ...c, is_deleted: true } : c))
    setConfirmDeleteId(null)
    const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      // Revert on failure
      setColleges(prev => prev.map(c => c.id === id ? { ...c, is_deleted: false } : c))
      const data = await res.json()
      setDeleteError(data.error || 'Failed to delete college')
    }
  }

  const inputClass = 'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">College Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, and manage colleges on the platform.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:-translate-y-0.5 ${
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

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-2xl border border-border/60 bg-card p-6 shadow-soft space-y-4">
              <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-sans)' }}>New College</h3>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="College name" className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} placeholder="City" className={inputClass} />
                <input value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} placeholder="State" className={inputClass} />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description (optional)" className={`${inputClass} resize-none`} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Minimum Fee (INR/year)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.fee_min}
                    onChange={(e) => setForm({...form, fee_min: e.target.value === '' ? '' : Number(e.target.value)})}
                    placeholder="e.g. 50000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Maximum Fee (INR/year)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.fee_max}
                    onChange={(e) => setForm({...form, fee_max: e.target.value === '' ? '' : Number(e.target.value)})}
                    placeholder="e.g. 200000"
                    className={inputClass}
                  />
                </div>
              </div>
              <button onClick={handleCreate} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:-translate-y-0.5">
                Create College
              </button>
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
        <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Featured</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {colleges.map((c) => (
                <tr key={c.id} className={`transition-colors hover:bg-muted/30 ${c.is_deleted ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-4 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.city}, {c.state}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                      c.status === 'active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {c.is_featured ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.333l2.06 4.174 4.607.67-3.334 3.25.787 4.586L8 11.847l-4.12 2.166.787-4.586L1.333 6.177l4.607-.67L8 1.333z"/></svg>
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {!c.is_deleted ? (
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === c.id ? (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
                            <span className="text-xs font-medium text-red-700">Are you sure?</span>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-background transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
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
                    ) : (
                      <span className="text-xs text-muted-foreground">Deleted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {colleges.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No colleges yet. Add your first college above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
