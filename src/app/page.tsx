import { createClient } from '@/lib/supabase/server'
import { LandingClient } from './landing-client'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: featuredColleges } = await supabase
    .from('colleges')
    .select('id, name, city, state, image_paths, fee_min, fee_max, description, placement_rate, college_type, established_year, accreditation, hostel_available, scholarship')
    .eq('status', 'active')
    .eq('is_featured', true)
    .limit(6)

  return <LandingClient colleges={featuredColleges ?? []} />
}
