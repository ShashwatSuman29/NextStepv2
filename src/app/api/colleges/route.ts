import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { collegeFiltersSchema } from '@/validators/college'

// Revalidate this public API every 1 hour on Vercel Edge caching
export const revalidate = 3600

/**
 * GET /api/colleges — Public. Paginated (max 50/page), filterable directory.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = collegeFiltersSchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const {
    page, pageSize, city, state, stream, course, fee_min, fee_max, exam, search,
    college_type, has_hostel, has_scholarship, placement_min, sort_by, sort_order,
  } = parsed.data

  const supabase = await createClient()
  
  const selectQuery = (stream || course || exam) 
    ? '*, college_courses!inner(*)' 
    : '*, college_courses(*)';

  let query = supabase
    .from('colleges')
    .select(selectQuery, { count: 'exact' })
    .eq('status', 'active')

  if (city) query = query.eq('city', city)
  if (state) query = query.eq('state', state)
  if (fee_min != null) query = query.gte('fee_min', fee_min)
  if (fee_max != null) query = query.lte('fee_max', fee_max)
  if (search) query = query.textSearch('name', search, { type: 'websearch' })
  if (college_type) query = query.eq('college_type', college_type)
  if (has_hostel) query = query.eq('hostel_available', true)
  if (has_scholarship) query = query.eq('scholarship', true)
  if (placement_min != null) query = query.gte('placement_rate', placement_min)

  if (stream) {
    query = query.eq('college_courses.stream', stream)
  }

  if (course) {
    query = query.ilike('college_courses.course_name', `%${course}%`)
  }

  if (exam) {
    query = query.contains('college_courses.exams_accepted', [exam])
  }

  // Sorting
  const orderCol = sort_by || 'created_at'
  const ascending = sort_order === 'asc'
  query = query.order(orderCol, { ascending })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('DB error fetching colleges:', error.message)
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 })
  }

  const res = NextResponse.json({ data, count, page, pageSize })
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return res
}
