import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications — In-app notifications. ?unread=true filter.
 * Uses session client (RLS SELECT policy allows own notifications).
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('student_id', dbUser.id)
    .eq('channel', 'in_app')
    .order('created_at', { ascending: false })
    .limit(50)

  const { searchParams } = new URL(request.url)
  if (searchParams.get('unread') === 'true') {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * DELETE /api/notifications — Delete all own notifications.
 * Uses service client for DB writes — RLS only has SELECT policy for students.
 */
export async function DELETE() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('student_id', dbUser.id)

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
