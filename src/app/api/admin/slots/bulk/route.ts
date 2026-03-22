import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { bulkCreateSlotsSchema } from '@/validators/slot'

/**
 * POST /api/admin/slots/bulk — Bulk create slots.
 */
export async function POST(request: Request) {
  const { error, adminDbId } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', adminDbId)
    .single()

  if (!adminUser) return NextResponse.json({ error: 'Admin user record not found' }, { status: 500 })

  const body = await request.json()
  const parsed = bulkCreateSlotsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const slotsToInsert = parsed.data.slots.map((slot) => ({
    ...slot,
    created_by: adminUser.id,
  }))

  const { data, error: dbError } = await supabase
    .from('counselling_slots')
    .insert(slotsToInsert)
    .select()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
