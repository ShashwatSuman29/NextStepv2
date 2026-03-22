import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'
import { createSlotSchema } from '@/validators/slot'

/**
 * GET /api/admin/slots — All slots.
 */
export async function GET() {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { data, error: dbError } = await supabase
    .from('counselling_slots')
    .select('*')
    .order('slot_date')
    .order('slot_time')

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data })
}

/**
 * POST /api/admin/slots — Create slot.
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
  const parsed = createSlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { data, error: dbError } = await supabase
    .from('counselling_slots')
    .insert({ ...parsed.data, created_by: adminUser.id })
    .select()
    .single()

  if (dbError) {
    if (dbError.code === '23505') {
      return NextResponse.json({ error: 'Slot already exists for this date/time' }, { status: 409 })
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
