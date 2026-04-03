import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { College, CollegeCourse } from '@/types'
import { CollegeDetailClient } from './client'

export const revalidate = 3600

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
