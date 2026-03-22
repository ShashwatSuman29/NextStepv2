import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateCollegeSchema } from '@/validators/college'

/**
 * PATCH /api/admin/colleges/[id] — Update college.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = updateCollegeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('colleges')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

/**
 * DELETE /api/admin/colleges/[id] — Soft delete. Blocked if active visits/bookings.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const supabase = createServiceClient()

  // Check for pending bookings referencing this college
  const { count: pendingBookings } = await supabase
    .from('counselling_bookings')
    .select('*', { count: 'exact', head: true })
    .eq('context_college_id', id)
    .in('status', ['pending', 'confirmed'])

  const { count: pendingVisits } = await supabase
    .from('college_visits')
    .select('*', { count: 'exact', head: true })
    .eq('college_id', id)
    .in('status', ['pending', 'confirmed'])

  if ((pendingBookings ?? 0) > 0 || (pendingVisits ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Cancel all pending activity before deleting.' },
      { status: 400 }
    )
  }

  const { error: dbError } = await supabase
    .from('colleges')
    .update({ is_deleted: true })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ message: 'College soft-deleted' })
}
