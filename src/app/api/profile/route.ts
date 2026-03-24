import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { profileSchema, profileUpdateSchema, computeIsComplete } from '@/validators/profile'
import type { ProfileInput } from '@/validators/profile'

/**
 * GET /api/profile — Fetch own profile (student only)
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  let { data: dbUser } = await admin
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) {
    const { data: created } = await admin
      .from('users')
      .insert({ auth_id: user.id, email: user.email!, role: 'student', is_verified: true })
      .select('id, role')
      .single()
    dbUser = created
  }

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: profile } = await admin
    .from('student_profiles')
    .select('*')
    .eq('user_id', dbUser.id)
    .single()

  return NextResponse.json({ data: profile })
}

/**
 * POST /api/profile — Create profile during onboarding. Sets is_complete.
 * Uses service client for DB writes (bypasses RLS).
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  let { data: dbUser } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  // Auto-create user record if missing
  if (!dbUser) {
    const { data: created, error: createErr } = await admin
      .from('users')
      .insert({
        auth_id: user.id,
        email: user.email!,
        role: 'student',
        is_verified: true,
      })
      .select('id')
      .single()

    if (createErr) {
      const { data: raceUser } = await admin
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      dbUser = raceUser
    } else {
      dbUser = created
    }

    if (!dbUser) return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
  }

  // Check if profile already exists
  const { data: existing } = await admin
    .from('student_profiles')
    .select('id')
    .eq('user_id', dbUser.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Profile already exists. Use PATCH to update.' }, { status: 409 })
  }

  const body = await request.json()
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const is_complete = computeIsComplete(parsed.data as ProfileInput)

  const { data: profile, error } = await admin
    .from('student_profiles')
    .insert({
      user_id: dbUser.id,
      ...parsed.data,
      is_complete,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.auth.updateUser({ data: { is_complete } })

  return NextResponse.json({ data: profile }, { status: 201 })
}

/**
 * PATCH /api/profile — Update own profile. Re-evaluates is_complete.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createServiceClient()

  let { data: dbUser } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) {
    const { data: created } = await admin
      .from('users')
      .insert({ auth_id: user.id, email: user.email!, role: 'student', is_verified: true })
      .select('id')
      .single()
    dbUser = created
  }

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: existing } = await admin
    .from('student_profiles')
    .select('*')
    .eq('user_id', dbUser.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Profile not found. Use POST to create.' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const merged = { ...existing, ...parsed.data }
  const is_complete = computeIsComplete(merged as ProfileInput)

  const { data: profile, error } = await admin
    .from('student_profiles')
    .update({ ...parsed.data, is_complete })
    .eq('user_id', dbUser.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.auth.updateUser({ data: { is_complete } })

  return NextResponse.json({ data: profile })
}
