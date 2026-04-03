import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/colleges/[id] — Public. Single college + courses.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  return NextResponse.json({ data: college })
}
