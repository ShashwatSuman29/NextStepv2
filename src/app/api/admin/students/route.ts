import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/students — Paginated list. Max 50/page. Search by name/email/phone.
 * Uses two queries for reliable profile fetching (avoids PostgREST join cache issues).
 */
export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 50)
  const search = searchParams.get('search')?.trim()

  const supabase = createServiceClient()
  const from = (page - 1) * pageSize

  // If searching by name/phone, find matching user IDs from profiles first
  let profileMatchUserIds: string[] | null = null
  if (search) {
    const { data: profileMatches } = await supabase
      .from('student_profiles')
      .select('user_id')
      .or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)

    profileMatchUserIds = profileMatches?.map((p) => p.user_id) ?? []
  }

  // Fetch users
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('role', 'student')

  if (search) {
    if (profileMatchUserIds && profileMatchUserIds.length > 0) {
      // Match by email OR by user IDs found from profile search
      query = query.or(`email.ilike.%${search}%,id.in.(${profileMatchUserIds.join(',')})`)
    } else {
      query = query.ilike('email', `%${search}%`)
    }
  }

  const { data: users, count, error: usersErr } = await query
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })
  if (!users || users.length === 0) return NextResponse.json({ data: [], count: 0, page, pageSize })

  // Fetch profiles for these users separately (reliable, no join issues)
  const userIds = users.map((u) => u.id)
  const { data: profiles } = await supabase
    .from('student_profiles')
    .select('*')
    .in('user_id', userIds)

  // Merge profiles into users
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]))
  const data = users.map((u) => ({
    ...u,
    student_profiles: profileMap.has(u.id) ? [profileMap.get(u.id)] : [],
  }))

  return NextResponse.json({ data, count, page, pageSize })
}
