import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateCollegeSchema } from '@/validators/college'
import { validateUuidParam } from '@/lib/utils'

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
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

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

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * DELETE /api/admin/colleges/[id] — Hard delete college and all related data.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

  const supabase = createServiceClient()

  // Delete all related data first (cascade)
  // 1. Delete saved_colleges entries
  await supabase.from('saved_colleges').delete().eq('college_id', id)

  // 2. Delete college_visits
  await supabase.from('college_visits').delete().eq('college_id', id)

  // 3. Delete counselling_bookings that reference this college via slots
  const { data: slots } = await supabase
    .from('counselling_slots')
    .select('id')
    .eq('college_id', id)

  if (slots && slots.length > 0) {
    const slotIds = slots.map(s => s.id)
    await supabase.from('counselling_bookings').delete().in('slot_id', slotIds)
  }

  // Also delete bookings that reference this college directly
  await supabase.from('counselling_bookings').delete().eq('context_college_id', id)

  // 4. Delete counselling_slots for this college
  await supabase.from('counselling_slots').delete().eq('college_id', id)

  // 5. Delete college_courses
  await supabase.from('college_courses').delete().eq('college_id', id)

  // 6. Finally delete the college itself
  const { error: dbError } = await supabase
    .from('colleges')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ message: 'College permanently deleted' })
}
