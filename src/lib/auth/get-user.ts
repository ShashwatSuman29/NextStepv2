import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { User, StudentProfile } from '@/types'

/**
 * Get the current authenticated user's DB record + optional profile.
 * Role is always read from public.users.role — never from metadata.
 * Uses session client for auth, service client for DB reads.
 */
export async function getCurrentUser(): Promise<{
  authUser: { id: string; email: string } | null
  dbUser: User | null
  profile: StudentProfile | null
}> {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) {
    return { authUser: null, dbUser: null, profile: null }
  }

  const serviceClient = createServiceClient()

  const { data: dbUser } = await serviceClient
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  if (!dbUser) {
    return { authUser: { id: user.id, email: user.email! }, dbUser: null, profile: null }
  }

  const { data: profile } = await serviceClient
    .from('student_profiles')
    .select('*')
    .eq('user_id', dbUser.id)
    .single()

  return {
    authUser: { id: user.id, email: user.email! },
    dbUser: dbUser as User,
    profile: profile as StudentProfile | null,
  }
}

/**
 * Verify student ownership: ensures the authenticated user matches the student_id.
 * Uses session client for auth, service client for DB reads.
 */
export async function verifyStudentOwnership(studentId: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) return { error: 'Unauthorized', status: 401 }

  const serviceClient = createServiceClient()
  const { data } = await serviceClient
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!data || data.id !== studentId) {
    return { error: 'Forbidden', status: 403 }
  }

  return { studentDbId: data.id }
}
