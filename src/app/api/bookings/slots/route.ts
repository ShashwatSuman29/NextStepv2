import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/bookings/slots — Available slots for students. ?date=YYYY-MM-DD
 * Uses service client to bypass RLS for reading available slots.
 */
export async function GET(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  // Use service client so RLS doesn't block slot reads
  const supabase = createServiceClient()

  let query = supabase
    .from('counselling_slots')
    .select('*')
    .eq('is_available', true)
    .order('slot_date')
    .order('slot_time')

  if (date) {
    query = query.eq('slot_date', date)
  } else {
    // Default: show upcoming slots (today and forward)
    query = query.gte('slot_date', new Date().toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}
