import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateBookingStatusSchema } from '@/validators/booking'
import { dispatchNotifications } from '@/lib/notifications/dispatch'
import { VALID_BOOKING_TRANSITIONS } from '@/types'
import type { BookingStatus } from '@/types'
import { validateUuidParam } from '@/lib/utils'

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
  const invalid = validateUuidParam(id)
  if (invalid) return invalid
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
 * PATCH /api/admin/bookings/[id] — Update status and/or meeting link.
 * Validates status transition only when status actually changes.
 * Allows updating meeting_link without changing status.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, adminDbId } = await verifyAdmin()
  if (error) return error

  const { id } = await params
  const invalid = validateUuidParam(id)
  if (invalid) return invalid

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

  if (!adminUser) return NextResponse.json({ error: 'Admin record not found' }, { status: 500 })

  // Fetch current booking
  const { data: booking } = await supabase
    .from('counselling_bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const currentStatus = booking.status as BookingStatus
  const newStatus = parsed.data.status
  const isStatusChange = newStatus !== currentStatus

  // Only validate transition if status is actually changing
  if (isStatusChange) {
    const valid = VALID_BOOKING_TRANSITIONS[currentStatus]
    if (!valid.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status transition.' }, { status: 400 })
    }
  }

  const updateData: Record<string, unknown> = {}

  // Only set status if it's changing
  if (isStatusChange) {
    updateData.status = newStatus
  }

  if (parsed.data.admin_notes) updateData.admin_notes = parsed.data.admin_notes
  if (parsed.data.cancellation_reason) updateData.cancellation_reason = parsed.data.cancellation_reason
  if (parsed.data.meeting_link !== undefined) updateData.meeting_link = parsed.data.meeting_link
  if (isStatusChange && newStatus === 'confirmed' && adminUser) updateData.confirmed_by = adminUser.id

  // Nothing to update
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ data: booking })
  }

  const { data: updated, error: dbError } = await supabase
    .from('counselling_bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  // Dispatch notification only on actual status change
  if (isStatusChange) {
    let customMsg: string | undefined
    if (newStatus === 'confirmed' && updateData.meeting_link) {
      customMsg = `Your counselling booking has been confirmed! Join your meeting here: ${updateData.meeting_link}`
    } else if (newStatus === 'confirmed' && booking.meeting_link) {
      customMsg = `Your counselling booking has been confirmed! Join your meeting here: ${booking.meeting_link}`
    }

    await dispatchNotifications(
      booking.student_id,
      `booking_${newStatus}` as 'booking_confirmed' | 'booking_cancelled' | 'booking_completed',
      booking.id,
      customMsg
    )
  }

  return NextResponse.json({ data: updated })
}
