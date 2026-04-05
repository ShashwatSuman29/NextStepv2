import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * PATCH /api/admin/streams/:id — Update a course/stream.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createServiceClient()
  const body = await request.json()

  const { data, error: dbError } = await supabase
    .from('college_courses')
    .update(body)
    .eq('id', id)
    .select('*, colleges(id, name)')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

/**
 * DELETE /api/admin/streams/:id — Delete a course/stream.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createServiceClient()

  const { error: dbError } = await supabase
    .from('college_courses')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
