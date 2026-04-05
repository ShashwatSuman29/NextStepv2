import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { createCollegeSchema } from '@/validators/college'

/**
 * GET /api/admin/colleges — All colleges (including inactive/deleted).
 */
export async function GET() {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('colleges')
    .select('*, college_courses(count)')
    .order('created_at', { ascending: false })

  if (dbError) {
    console.error('DB error fetching colleges:', dbError.message)
    return NextResponse.json({ error: 'Failed to fetch colleges' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * POST /api/admin/colleges — Create college.
 */
export async function POST(request: Request) {
  const { error, adminDbId } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()

  // Get admin_users.id from users.id
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', adminDbId)
    .single()

  if (!adminUser) return NextResponse.json({ error: 'Admin user record not found' }, { status: 500 })

  const body = await request.json()
  const parsed = createCollegeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { data: college, error: dbError } = await supabase
    .from('colleges')
    .insert({ ...parsed.data, created_by: adminUser.id })
    .select()
    .single()

  if (dbError) {
    console.error('DB error creating college:', dbError.message)
    return NextResponse.json({ error: 'Failed to create college' }, { status: 500 })
  }
  return NextResponse.json({ data: college }, { status: 201 })
}
