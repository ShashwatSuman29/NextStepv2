import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { createCourseSchema } from '@/validators/college'

/**
 * GET /api/admin/streams — All courses/streams with college name.
 */
export async function GET() {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('college_courses')
    .select('*, colleges(id, name)')
    .order('created_at', { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

/**
 * POST /api/admin/streams — Create a course/stream for a college.
 */
export async function POST(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const body = await request.json()
  const parsed = createCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { data: course, error: dbError } = await supabase
    .from('college_courses')
    .insert(parsed.data)
    .select('*, colleges(id, name)')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data: course }, { status: 201 })
}
