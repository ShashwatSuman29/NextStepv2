/**
 * Seed script — populates the database with test data.
 * Run: node scripts/seed.mjs
 *
 * Prerequisites: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read env from .env.local
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seed() {
  console.log('🌱 Starting database seed...\n')

  // ---- Step 1: Create admin auth user + DB records ----
  console.log('1. Creating admin user...')

  // Check if admin already exists
  let { data: existingAdmin } = await sb
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  let adminDbId

  if (existingAdmin) {
    console.log('   Admin already exists, reusing:', existingAdmin.id)
    adminDbId = existingAdmin.id
  } else {
    // Create auth user for admin
    const { data: authAdmin, error: authErr } = await sb.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'Admin@NextStep2024!',
      email_confirm: true,
    })

    if (authErr) {
      // If user already exists in auth, find their auth_id
      if (authErr.message.includes('already been registered')) {
        const { data: { users } } = await sb.auth.admin.listUsers()
        const found = users.find(u => u.email === 'admin@example.com')
        if (found) {
          // Insert into public.users
          const { data: inserted, error: insertErr } = await sb.from('users').insert({
            auth_id: found.id,
            email: 'admin@example.com',
            role: 'admin',
            is_verified: true,
          }).select('id').single()
          if (insertErr) {
            console.log('   Admin user record may already exist, checking...')
            const { data: existing2 } = await sb.from('users').select('id').eq('email', 'admin@example.com').single()
            adminDbId = existing2?.id
          } else {
            adminDbId = inserted.id
          }
        }
      } else {
        console.error('   Error creating admin auth user:', authErr.message)
        process.exit(1)
      }
    } else {
      // Insert into public.users
      const { data: adminUser, error: uErr } = await sb.from('users').insert({
        auth_id: authAdmin.user.id,
        email: 'admin@example.com',
        role: 'admin',
        is_verified: true,
      }).select('id').single()

      if (uErr) {
        console.error('   Error inserting admin into users:', uErr.message)
        process.exit(1)
      }
      adminDbId = adminUser.id
    }
  }

  // Ensure admin_users record exists
  const { data: existingAdminUser } = await sb
    .from('admin_users')
    .select('id')
    .eq('user_id', adminDbId)
    .single()

  let adminUserId
  if (existingAdminUser) {
    adminUserId = existingAdminUser.id
  } else {
    const { data: au, error: auErr } = await sb.from('admin_users').insert({
      user_id: adminDbId,
      full_name: 'NextStep Admin',
      email: 'admin@example.com',
    }).select('id').single()

    if (auErr) {
      console.error('   Error creating admin_users record:', auErr.message)
      process.exit(1)
    }
    adminUserId = au.id
  }

  console.log('   Admin DB ID:', adminDbId)
  console.log('   Admin User ID:', adminUserId)

  // ---- Step 2: Seed colleges ----
  console.log('\n2. Seeding colleges...')

  const colleges = [
    { name: 'Indian Institute of Technology, Delhi', city: 'New Delhi', state: 'Delhi', description: 'One of India\'s premier engineering institutions, known for cutting-edge research and innovation across multiple disciplines.', daily_visit_capacity: 8, status: 'active', is_featured: true },
    { name: 'Indian Institute of Technology, Bombay', city: 'Mumbai', state: 'Maharashtra', description: 'A world-class institute of eminence offering rigorous academic programs in engineering, science, and technology.', daily_visit_capacity: 10, status: 'active', is_featured: true },
    { name: 'National Institute of Technology, Trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu', description: 'One of the top NITs in India, renowned for its strong engineering programs and vibrant campus culture.', daily_visit_capacity: 7, status: 'active', is_featured: true },
    { name: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu', description: 'A leading private university offering diverse programs with a strong focus on industry partnerships and placements.', daily_visit_capacity: 10, status: 'active', is_featured: true },
    { name: 'Birla Institute of Technology & Science, Pilani', city: 'Pilani', state: 'Rajasthan', description: 'An institution of eminence known for its flexible academic system and strong alumni network across the globe.', daily_visit_capacity: 6, status: 'active', is_featured: true },
    { name: 'Christ University', city: 'Bangalore', state: 'Karnataka', description: 'A prestigious multi-disciplinary university in the heart of Bangalore offering diverse undergraduate and postgraduate programs.', daily_visit_capacity: 8, status: 'active', is_featured: true },
    { name: 'Manipal Institute of Technology', city: 'Manipal', state: 'Karnataka', description: 'A top-tier private engineering college known for excellent infrastructure, global exposure, and strong placement records.', daily_visit_capacity: 8, status: 'active', is_featured: false },
    { name: 'SRM Institute of Science and Technology', city: 'Chennai', state: 'Tamil Nadu', description: 'One of India\'s top-ranked universities with a comprehensive range of programs across engineering, management, and sciences.', daily_visit_capacity: 10, status: 'active', is_featured: false },
    { name: 'Symbiosis International University', city: 'Pune', state: 'Maharashtra', description: 'A renowned university offering world-class education in management, law, liberal arts, and technology.', daily_visit_capacity: 7, status: 'active', is_featured: false },
    { name: 'Amity University', city: 'Noida', state: 'Uttar Pradesh', description: 'India\'s leading research and innovation-driven private university with state-of-the-art facilities.', daily_visit_capacity: 10, status: 'active', is_featured: false },
    { name: 'Lovely Professional University', city: 'Phagwara', state: 'Punjab', description: 'One of India\'s largest private universities offering 200+ programs with global academic collaborations.', daily_visit_capacity: 10, status: 'active', is_featured: false },
    { name: 'Jadavpur University', city: 'Kolkata', state: 'West Bengal', description: 'A prestigious public university known for its outstanding engineering and science departments since 1955.', daily_visit_capacity: 5, status: 'active', is_featured: false },
  ]

  // Check if colleges already exist
  const { count: existingCollegeCount } = await sb.from('colleges').select('id', { count: 'exact', head: true })

  if (existingCollegeCount && existingCollegeCount > 0) {
    console.log(`   ${existingCollegeCount} colleges already exist, skipping...`)
  } else {
    const { data: insertedColleges, error: cErr } = await sb.from('colleges')
      .insert(colleges.map(c => ({ ...c, created_by: adminUserId, image_paths: [] })))
      .select('id, name')

    if (cErr) {
      console.error('   Error seeding colleges:', cErr.message)
    } else {
      console.log(`   Seeded ${insertedColleges.length} colleges`)

      // ---- Step 3: Seed courses for each college ----
      console.log('\n3. Seeding college courses...')

      const courseTemplates = [
        { course_name: 'B.Tech Computer Science', branch: 'Computer Science', stream: 'UG', duration_years: 4, annual_fee: 250000, eligibility: '10+2 with PCM', exams_accepted: ['JEE Main', 'JEE Advanced'] },
        { course_name: 'B.Tech Electrical Engineering', branch: 'Electrical', stream: 'UG', duration_years: 4, annual_fee: 230000, eligibility: '10+2 with PCM', exams_accepted: ['JEE Main', 'JEE Advanced'] },
        { course_name: 'B.Tech Mechanical Engineering', branch: 'Mechanical', stream: 'UG', duration_years: 4, annual_fee: 220000, eligibility: '10+2 with PCM', exams_accepted: ['JEE Main'] },
        { course_name: 'BBA', branch: null, stream: 'UG', duration_years: 3, annual_fee: 180000, eligibility: '10+2 any stream', exams_accepted: ['CUET'] },
        { course_name: 'M.Tech Computer Science', branch: 'Computer Science', stream: 'PG', duration_years: 2, annual_fee: 300000, eligibility: 'B.Tech/BE', exams_accepted: ['GATE'] },
        { course_name: 'MBA', branch: null, stream: 'PG', duration_years: 2, annual_fee: 500000, eligibility: 'Bachelor\'s degree', exams_accepted: ['CAT', 'XAT', 'GMAT'] },
      ]

      const allCourses = []
      for (const college of insertedColleges) {
        // Each college gets 3-5 random courses
        const numCourses = 3 + Math.floor(Math.random() * 3)
        const shuffled = [...courseTemplates].sort(() => Math.random() - 0.5).slice(0, numCourses)
        for (const ct of shuffled) {
          // Vary fees slightly per college
          const feeVariance = Math.floor(Math.random() * 100000) - 50000
          allCourses.push({
            college_id: college.id,
            ...ct,
            annual_fee: Math.max(50000, (ct.annual_fee || 200000) + feeVariance),
          })
        }
      }

      const { error: courseErr } = await sb.from('college_courses').insert(allCourses)
      if (courseErr) {
        console.error('   Error seeding courses:', courseErr.message)
      } else {
        console.log(`   Seeded ${allCourses.length} courses across ${insertedColleges.length} colleges`)
      }
    }
  }

  // ---- Step 4: Seed counselling slots ----
  console.log('\n4. Seeding counselling slots...')

  const { count: existingSlotCount } = await sb.from('counselling_slots').select('id', { count: 'exact', head: true })

  if (existingSlotCount && existingSlotCount > 0) {
    console.log(`   ${existingSlotCount} slots already exist, skipping...`)
  } else {
    const slots = []
    const today = new Date()
    for (let d = 1; d <= 14; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const dateStr = date.toISOString().split('T')[0]

      // Skip Sundays
      if (date.getDay() === 0) continue

      const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      for (const time of times) {
        slots.push({
          slot_date: dateStr,
          slot_time: time,
          max_capacity: 1,
          booked_count: 0,
          is_available: true,
          created_by: adminUserId,
        })
      }
    }

    const { error: slotErr } = await sb.from('counselling_slots').insert(slots)
    if (slotErr) {
      console.error('   Error seeding slots:', slotErr.message)
    } else {
      console.log(`   Seeded ${slots.length} counselling slots (next 14 days, Mon-Sat)`)
    }
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Admin credentials:')
  console.log('   Email: admin@example.com')
  console.log('   Password: Admin@NextStep2024!')
  console.log('   (Use these to log into the admin panel)')
}

seed().catch(console.error)
