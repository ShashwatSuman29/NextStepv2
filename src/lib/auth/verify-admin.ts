import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Layer 2 check: call at the top of every admin API handler.
 * Reads role from public.users — NEVER from JWT metadata.
 * Uses session client for auth, service client for DB reads.
 */
export async function verifyAdmin() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Read role from DB via service client (bypasses RLS)
  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!data || data.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { adminDbId: data.id }
}
