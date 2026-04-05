import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const settingsUpdateSchema = z.object({
  counselling_price_inr: z.number().positive().max(100000).optional(),
  visit_price_inr: z.number().positive().max(100000).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()
  const { data: dbUser } = await serviceClient
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await serviceClient
    .from('platform_settings')
    .select('*')
    .single()

  if (error) {
    // If no row exists, we might return empty or create one
    if (error.code === 'PGRST116') {
      return NextResponse.json({ data: { counselling_price_inr: 199, visit_price_inr: 499 } })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()
  const { data: dbUser } = await serviceClient
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser || dbUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = settingsUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  const counselling_price_inr = parsed.data.counselling_price_inr ?? 199
  const visit_price_inr = parsed.data.visit_price_inr ?? 499

  // In Supabase, usually there is exactly 1 row in platform_settings.
  // We can fetch it first to get the ID, or just update using some condition.
  const { data: existing } = await serviceClient.from('platform_settings').select('id').limit(1).single()

  if (existing) {
    const { data, error } = await serviceClient
      .from('platform_settings')
      .update({ counselling_price_inr, visit_price_inr })
      .eq('id', existing.id)
      .select()
      .single()
      
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json({ data })
  } else {
    // If it doesn't exist, insert
    const { data, error } = await serviceClient
      .from('platform_settings')
      .insert({ counselling_price_inr, visit_price_inr })
      .select()
      .single()
      
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json({ data })
  }
}
