import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { validateUuidParam } from '@/lib/utils'

/**
 * GET /api/admin/students/[id] — Single student with profile.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid
  const supabase = createServiceClient()

  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('role', 'student')
    .single()

  if (userErr || !user) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  // Fetch profile separately for reliability
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', id)
    .single()

  const data = {
    ...user,
    student_profiles: profile ? [profile] : [],
  }

  return NextResponse.json({ data })
}
