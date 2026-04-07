import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { College, CollegeCourse } from '@/types'
import { CollegeDetailClient } from './client'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: college } = await supabase
    .from('colleges')
    .select('name, city, state, description, image_paths')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!college) return { title: 'College Not Found | NextStep' }

  const title = `${college.name} — ${college.city}, ${college.state} | NextStep`
  const description = college.description
    ? college.description.slice(0, 160)
    : `Explore ${college.name} in ${college.city}, ${college.state}. View fees, placements, courses and more on NextStep.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(college.image_paths?.[0] ? { images: [{ url: college.image_paths[0] }] } : {}),
    },
  }
}

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: college } = await supabase
    .from('colleges')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!college) notFound()

  const { data: courses } = await supabase
    .from('college_courses')
    .select('*')
    .eq('college_id', id)
    .order('stream')

  return (
    <CollegeDetailClient
      college={college as College}
      courses={(courses ?? []) as CollegeCourse[]}
    />
  )
}
