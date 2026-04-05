import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateSlotSchema } from '@/validators/slot'
import { validateUuidParam } from '@/lib/utils'

/**
 * PATCH /api/admin/slots/[id] — Toggle is_available, change capacity.
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
  const parsed = updateSlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('counselling_slots')
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
 * DELETE /api/admin/slots/[id] — Delete. Blocked if bookings exist.
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

  const { count } = await supabase
    .from('counselling_bookings')
    .select('*', { count: 'exact', head: true })
    .eq('slot_id', id)

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Cannot delete slot with existing bookings' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('counselling_slots')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json({ message: 'Slot deleted' })
}
