import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/metrics — Dashboard metrics.
 */
export async function GET() {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()

  const [students, bookings, visits, colleges, transactions] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('counselling_bookings').select('status'),
    supabase.from('college_visits').select('status'),
    supabase.from('colleges').select('*', { count: 'exact', head: true }),
    supabase.from('payment_transactions').select('amount_inr').eq('status', 'success'),
  ])
  
  const totalRevenue = transactions.data?.reduce((acc, curr) => acc + (curr.amount_inr || 0), 0) || 0;

  const bookingsByStatus = {
    pending: 0, confirmed: 0, completed: 0, cancelled: 0,
  }
  bookings.data?.forEach((b) => {
    const s = b.status as keyof typeof bookingsByStatus
    if (s in bookingsByStatus) bookingsByStatus[s]++
  })

  const visitsByStatus = {
    pending: 0, confirmed: 0, completed: 0, cancelled: 0,
  }
  visits.data?.forEach((v) => {
    const s = v.status as keyof typeof visitsByStatus
    if (s in visitsByStatus) visitsByStatus[s]++
  })

  return NextResponse.json({
    data: {
      totalStudents: students.count ?? 0,
      totalColleges: colleges.count ?? 0,
      bookingsByStatus,
      visitsByStatus,
      totalBookings: bookings.data?.length ?? 0,
      totalVisits: visits.data?.length ?? 0,
      totalRevenue,
    },
  })
}
