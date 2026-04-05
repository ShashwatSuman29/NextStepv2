import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { updateVisitStatusSchema } from '@/validators/visit'
import { dispatchNotifications } from '@/lib/notifications/dispatch'
import { VALID_VISIT_TRANSITIONS } from '@/types'
import type { VisitStatus } from '@/types'
import { validateUuidParam } from '@/lib/utils'

/**
 * PATCH /api/admin/visits/[id] — Update status. DISPATCHES notification on change.
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
  const parsed = updateVisitStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', adminDbId)
    .single()

  if (!adminUser) return NextResponse.json({ error: 'Admin record not found' }, { status: 500 })

  const { data: visit } = await supabase
    .from('college_visits')
    .select('*')
    .eq('id', id)
    .single()

  if (!visit) return NextResponse.json({ error: 'Visit not found' }, { status: 404 })

  const currentStatus = visit.status as VisitStatus
  const newStatus = parsed.data.status
  const valid = VALID_VISIT_TRANSITIONS[currentStatus]

  if (!valid.includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status transition.' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { status: newStatus }
  if (parsed.data.admin_notes) updateData.admin_notes = parsed.data.admin_notes
  if (parsed.data.cancellation_reason) updateData.cancellation_reason = parsed.data.cancellation_reason
  if (newStatus === 'confirmed' && adminUser) updateData.confirmed_by = adminUser.id

  const { data: updated, error: dbError } = await supabase
    .from('college_visits')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) {
    console.error('DB error:', dbError.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  if (newStatus !== currentStatus) {
    await dispatchNotifications(
      visit.student_id,
      `visit_${newStatus}` as 'visit_confirmed' | 'visit_cancelled' | 'visit_completed',
      visit.id
    )
  }

  return NextResponse.json({ data: updated })
}
