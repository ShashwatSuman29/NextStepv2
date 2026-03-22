import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/visits — All visits. Filter by status, college.
 */
export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 50)

  const supabase = createServiceClient()
  let query = supabase
    .from('college_visits')
    .select('*, student:users(id, email), college:colleges(id, name, city)', { count: 'exact' })

  if (status) query = query.eq('status', status)

  const from = (page - 1) * pageSize
  const { data, count, error: dbError } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data, count, page, pageSize })
}
