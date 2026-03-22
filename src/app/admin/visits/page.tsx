'use client'

import { useEffect, useState } from 'react'

interface Visit {
  id: string
  status: string
  visit_date: string
  visit_time: string | null
  created_at: string
  student: { id: string; email: string }
  college: { id: string; name: string; city: string }
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled']

const statusStyles: Record<string, string> = {
  confirmed: 'border-green-200 bg-green-50 text-green-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
}

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchVisits = async () => {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    const res = await fetch(`/api/admin/visits${params}`)
    const data = await res.json()
    setVisits(data.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchVisits()

    // Auto-refresh every 30s for new student visit requests
    const interval = setInterval(() => {
      fetchVisits()
    }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/visits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) fetchVisits()
    else {
      const data = await res.json()
      alert(data.error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Visit Management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Review and manage campus visit requests.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${!filter ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}>
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-primary text-primary-foreground shadow-md' : 'border border-border bg-card text-muted-foreground hover:bg-accent'}`}>
            {s}
          </button>
        ))}
      </div>

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
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">College</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {visits.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4 text-foreground">{v.student?.email}</td>
                  <td className="px-5 py-4 text-muted-foreground">{v.college?.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{v.visit_date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[v.status] ?? statusStyles.pending}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {v.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleStatusChange(v.id, 'confirmed')}
                          className="rounded-lg bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">Confirm</button>
                        <button onClick={() => handleStatusChange(v.id, 'cancelled')}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
                      </div>
                    )}
                    {v.status === 'confirmed' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleStatusChange(v.id, 'completed')}
                          className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">Complete</button>
                        <button onClick={() => handleStatusChange(v.id, 'cancelled')}
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
                      </div>
                    )}
                    {(v.status === 'completed' || v.status === 'cancelled') && (
                      <span className="text-xs text-muted-foreground">Terminal state</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visits.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No visits found{filter ? ` with status "${filter}"` : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
