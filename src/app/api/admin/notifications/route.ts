import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/notifications
 * Returns recent pending bookings and visits as admin notification items.
 * Query params:
 *   ?since=<ISO timestamp>  — only items created after this time
 *   ?limit=<number>         — max items (default 20)
 */
export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const supabase = createServiceClient()

  // Fetch recent pending bookings
  let bookingQuery = supabase
    .from('counselling_bookings')
    .select('id, status, booking_type, preferred_date, preferred_time, created_at, student:users(id, email, student_profiles(full_name))')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (since) {
    bookingQuery = bookingQuery.gte('created_at', since)
  }

  // Fetch recent pending visits
  let visitQuery = supabase
    .from('college_visits')
    .select('id, status, visit_date, visit_time, created_at, student:users(id, email), college:colleges(id, name, city)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (since) {
    visitQuery = visitQuery.gte('created_at', since)
  }

  const [bookingsRes, visitsRes] = await Promise.all([bookingQuery, visitQuery])

  if (bookingsRes.error) return NextResponse.json({ error: bookingsRes.error.message }, { status: 500 })
  if (visitsRes.error) return NextResponse.json({ error: visitsRes.error.message }, { status: 500 })

  // Transform into unified notification items
  const notifications: {
    id: string
    type: 'booking' | 'visit'
    status: string
    message: string
    studentName: string
    studentEmail: string
    detail: string
    created_at: string
  }[] = []

  for (const b of bookingsRes.data ?? []) {
    const studentName = (b.student as any)?.student_profiles?.[0]?.full_name || ''
    const studentEmail = (b.student as any)?.email || ''
    const name = studentName || studentEmail.split('@')[0]
    notifications.push({
      id: b.id,
      type: 'booking',
      status: b.status,
      message: b.status === 'pending'
        ? `New counselling booking from ${name}`
        : `Booking ${b.status} — ${name}`,
      studentName: name,
      studentEmail,
      detail: `${b.booking_type} · ${b.preferred_date} at ${b.preferred_time}`,
      created_at: b.created_at,
    })
  }

  for (const v of visitsRes.data ?? []) {
    const studentEmail = (v.student as any)?.email || ''
    const name = studentEmail.split('@')[0]
    const collegeName = (v.college as any)?.name || 'Unknown College'
    notifications.push({
      id: v.id,
      type: 'visit',
      status: v.status,
      message: v.status === 'pending'
        ? `New visit request from ${name}`
        : `Visit ${v.status} — ${name}`,
      studentName: name,
      studentEmail,
      detail: `${collegeName} · ${v.visit_date}`,
      created_at: v.created_at,
    })
  }

  // Sort all by created_at descending
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Count pending items
  const pendingCount = notifications.filter(n => n.status === 'pending').length

  return NextResponse.json({
    data: notifications.slice(0, limit),
    pendingCount,
  })
}
