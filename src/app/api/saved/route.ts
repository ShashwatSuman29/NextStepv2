import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/saved — Own saved colleges.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('saved_colleges')
    .select('id, college_id, college:colleges(id, name, city, state, fee_min, fee_max, image_paths, college_type, placement_rate)')
    .eq('student_id', dbUser.id)
    .order('saved_at', { ascending: false })

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * POST /api/saved — Save a college. Max 10 check.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()
  const { college_id } = body

  if (!college_id) return NextResponse.json({ error: 'college_id required' }, { status: 400 })

  // Max 10 check
  const { count } = await supabase
    .from('saved_colleges')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', dbUser.id)

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'You can save up to 10 colleges.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saved_colleges')
    .insert({ student_id: dbUser.id, college_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already saved' }, { status: 409 })
    }
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
