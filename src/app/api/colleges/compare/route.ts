import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/colleges/compare?ids=id1,id2,id3 — Public. Compare multiple colleges.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ error: 'ids parameter required' }, { status: 400 })
  }

  const ids = idsParam.split(',').filter(Boolean)
  if (ids.length === 0 || ids.length > 5) {
    return NextResponse.json({ error: 'Provide 1-5 college IDs' }, { status: 400 })
  }

  if (!ids.every(id => UUID_RE.test(id))) {
    return NextResponse.json({ error: 'Invalid college ID format' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('id, name, city, state, description, fee_min, fee_max, daily_visit_capacity, placement_rate, avg_package, highest_package, hostel_available, scholarship, accreditation, college_type, ranking, campus_size, established_year, website, facilities, image_paths, college_courses(id, course_name, branch, stream, duration_years, annual_fee, exams_accepted)')
    .in('id', ids)
    .eq('status', 'active')

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
