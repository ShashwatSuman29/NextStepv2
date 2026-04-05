import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createVisitSchema } from '@/validators/visit'

/**
 * GET /api/visits — Own visit requests.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('college_visits')
    .select('*, college:colleges(id, name, city, state)')
    .eq('student_id', dbUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
  return NextResponse.json({ data })
}

/**
 * POST /api/visits — Create visit.
 * Checks: college active, profile is_complete, daily capacity. NO notification here.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Check is_complete and free limits
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('is_complete, used_free_visits, purchased_visits')
    .eq('user_id', dbUser.id)
    .single()

  if (!profile?.is_complete) {
    return NextResponse.json({ error: 'Complete your profile first' }, { status: 403 })
  }

  // Freemium Logic: Check purchased credits first, then free limits
  const hasPurchased = (profile.purchased_visits ?? 0) > 0;

  if (!hasPurchased && (profile.used_free_visits ?? 0) >= 1) {
    const { data: settings } = await supabase.from('platform_settings').select('visit_price_inr').single()
    return NextResponse.json({ 
      error: 'Free limit reached', 
      requires_payment: true, 
      price: settings?.visit_price_inr || 499 
    }, { status: 402 })
  }

  const body = await request.json()
  const parsed = createVisitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { college_id, visit_date, visit_time } = parsed.data

  // Check college is active
  const { data: college } = await supabase
    .from('colleges')
    .select('id, daily_visit_capacity, status')
    .eq('id', college_id)
    .single()

  if (!college || college.status !== 'active') {
    return NextResponse.json({ error: 'College not found or inactive' }, { status: 404 })
  }

  // Check daily capacity
  const { count } = await supabase
    .from('college_visits')
    .select('*', { count: 'exact', head: true })
    .eq('college_id', college_id)
    .eq('visit_date', visit_date)
    .neq('status', 'cancelled')

  if ((count ?? 0) >= college.daily_visit_capacity) {
    return NextResponse.json(
      { error: 'Visit capacity for this date is full.' },
      { status: 409 }
    )
  }

  const { data: visit, error } = await supabase
    .from('college_visits')
    .insert({
      student_id: dbUser.id,
      college_id,
      visit_date,
      visit_time: visit_time || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already have a visit request for this college on this date.' }, { status: 409 })
    }
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  // Increment odometer or decrement purchased credits
  if ((profile.purchased_visits ?? 0) > 0) {
    await supabase
      .from('student_profiles')
      .update({ purchased_visits: profile.purchased_visits - 1 })
      .eq('user_id', dbUser.id)
  } else {
    await supabase
      .from('student_profiles')
      .update({ used_free_visits: (profile.used_free_visits ?? 0) + 1 })
      .eq('user_id', dbUser.id)
  }

  return NextResponse.json({ data: visit }, { status: 201 })
}
