/**
 * One-time script to provision a new admin user.
 * Usage: npx tsx scripts/add-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ADMIN_EMAIL = 'amitprasad212003@gmail.com'
const ADMIN_PASSWORD = 'Amit@9659'
const ADMIN_NAME = 'Amit Prasad'

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log('1. Creating Supabase Auth user...')

  // Check if auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingAuth = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)

  let authId: string

  if (existingAuth) {
    console.log(`   Auth user already exists: ${existingAuth.id}`)
    authId = existingAuth.id

    // Update password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(authId, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })
    if (updateErr) {
      console.error('   Failed to update password:', updateErr.message)
    } else {
      console.log('   Password updated.')
    }
  } else {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })

    if (authError) {
      console.error('   Failed to create auth user:', authError.message)
      process.exit(1)
    }

    authId = authUser.user.id
    console.log(`   Auth user created: ${authId}`)
  }

  console.log('2. Checking public.users table...')

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_id', authId)
    .single()

  let userId: string

  if (existingUser) {
    userId = existingUser.id
    if (existingUser.role !== 'admin') {
      console.log(`   User exists with role="${existingUser.role}", upgrading to admin...`)
      const { error: updateErr } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)
      if (updateErr) {
        console.error('   Failed to update role:', updateErr.message)
        process.exit(1)
      }
      console.log('   Role updated to admin.')
    } else {
      console.log(`   User already has admin role.`)
    }
  } else {
    console.log('   Creating users record with role=admin...')
    const { data: newUser, error: insertErr } = await supabase
      .from('users')
      .insert({
        auth_id: authId,
        email: ADMIN_EMAIL,
        role: 'admin',
        is_verified: true,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('   Failed to insert user:', insertErr.message)
      process.exit(1)
    }
    userId = newUser.id
    console.log(`   User created: ${userId}`)
  }

  console.log('3. Checking admin_users table...')

  const { data: existingAdmin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingAdmin) {
    console.log('   Admin record already exists.')
  } else {
    const { error: adminErr } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        full_name: ADMIN_NAME,
        email: ADMIN_EMAIL,
      })

    if (adminErr) {
      console.error('   Failed to insert admin_users:', adminErr.message)
      process.exit(1)
    }
    console.log('   Admin record created.')
  }

  // Set app_metadata so middleware recognizes admin
  await supabase.auth.admin.updateUserById(authId, {
    app_metadata: { role: 'admin' },
  })

  console.log('\n--- DONE ---')
  console.log(`Admin provisioned: ${ADMIN_EMAIL}`)
  console.log(`Password: ${ADMIN_PASSWORD}`)
  console.log('You can now log in at /auth/login')
}

main().catch(console.error)
