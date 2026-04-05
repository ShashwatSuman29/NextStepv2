import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/bookings — All bookings. Filter by status, date.
 */
export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '20') || 20), 50)

  const supabase = createServiceClient()
  let query = supabase
    .from('counselling_bookings')
    .select('*, student:users(id, email, student_profiles(full_name)), slot:counselling_slots(slot_date, slot_time)', { count: 'exact' })

  if (status) query = query.eq('status', status)

  const from = (page - 1) * pageSize
  const { data, count, error: dbError } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
  return NextResponse.json({ data, count, page, pageSize })
}
