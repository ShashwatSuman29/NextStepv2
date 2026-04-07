import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateUuidParam } from '@/lib/utils'

/**
 * GET /api/colleges/[id] — Public. Single college + courses.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

  const supabase = await createClient()

  const { data: college, error } = await supabase
    .from('colleges')
    .select('*, college_courses(*)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !college) {
    return NextResponse.json({ error: 'College not found' }, { status: 404 })
  }

  const res = NextResponse.json({ data: college })
  res.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600')
  return res
}
