import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/students/[id] — Single student profile.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createServiceClient()

  const { data, error: dbError } = await supabase
    .from('users')
    .select('*, student_profiles(*)')
    .eq('id', id)
    .eq('role', 'student')
    .single()

  if (dbError || !data) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  return NextResponse.json({ data })
}
