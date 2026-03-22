import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateBookingStatusSchema } from '@/validators/booking'
import { dispatchNotifications } from '@/lib/notifications/dispatch'
import { VALID_BOOKING_TRANSITIONS } from '@/types'
import type { BookingStatus } from '@/types'

/**
 * GET /api/admin/bookings/[id] — Single booking with student profile.
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
    .from('counselling_bookings')
    .select('*, student:users(id, email), slot:counselling_slots(*), profile:users!inner(student_profiles(*))')
    .eq('id', id)
    .single()

  if (dbError || !data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  return NextResponse.json({ data })
}

/**
 * PATCH /api/admin/bookings/[id] — Update status. Validates transition. DISPATCHES notification.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, adminDbId } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = updateBookingStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Get admin_users.id
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', adminDbId)
    .single()

  // Fetch current booking
  const { data: booking } = await supabase
    .from('counselling_bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // Validate status transition
  const currentStatus = booking.status as BookingStatus
  const newStatus = parsed.data.status
  const valid = VALID_BOOKING_TRANSITIONS[currentStatus]

  if (!valid.includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status transition.' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (parsed.data.admin_notes) updateData.admin_notes = parsed.data.admin_notes
  if (parsed.data.cancellation_reason) updateData.cancellation_reason = parsed.data.cancellation_reason
  if (newStatus === 'confirmed' && adminUser) updateData.confirmed_by = adminUser.id

  const { data: updated, error: dbError } = await supabase
    .from('counselling_bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Dispatch notification on status change
  if (newStatus !== currentStatus) {
    await dispatchNotifications(
      booking.student_id,
      `booking_${newStatus}` as 'booking_confirmed' | 'booking_cancelled' | 'booking_completed',
      booking.id
    )
  }

  return NextResponse.json({ data: updated })
}
