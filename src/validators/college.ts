import { z } from 'zod'

export const createCollegeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  description: z.string().max(5000).nullable().optional(),
  image_paths: z.array(z.string()).default([]),
  daily_visit_capacity: z.number().int().min(1).max(500).default(5),
  status: z.enum(['active', 'inactive']).default('inactive'),
  is_featured: z.boolean().default(false),
  fee_min: z.number().int().min(0).nullable().optional(),
  fee_max: z.number().int().min(0).nullable().optional(),
  established_year: z.number().int().min(1800).max(2030).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  accreditation: z.string().max(500).nullable().optional(),
  ranking: z.string().max(500).nullable().optional(),
  campus_size: z.string().max(200).nullable().optional(),
  placement_rate: z.number().min(0).max(100).nullable().optional(),
  avg_package: z.number().min(0).nullable().optional(),
  highest_package: z.number().min(0).nullable().optional(),
  facilities: z.array(z.string()).default([]),
  hostel_available: z.boolean().default(false),
  scholarship: z.boolean().default(false),
  college_type: z.enum(['government', 'private', 'deemed', 'autonomous']).default('private'),
})

export const updateCollegeSchema = createCollegeSchema.partial()

export const createCourseSchema = z.object({
  college_id: z.string().uuid(),
  course_name: z.string().min(1).max(100),
  branch: z.string().max(100).nullable().optional(),
  stream: z.enum(['UG', 'PG']),
  duration_years: z.number().int().positive().nullable().optional(),
  annual_fee: z.number().int().nonnegative().nullable().optional(),
  eligibility: z.string().max(1000).nullable().optional(),
  exams_accepted: z.array(z.string()).default([]),
})

export const collegeFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  city: z.string().optional(),
  state: z.string().optional(),
  stream: z.enum(['UG', 'PG']).optional(),
  course: z.string().optional(),
  fee_min: z.coerce.number().int().nonnegative().optional(),
  fee_max: z.coerce.number().int().nonnegative().optional(),
  exam: z.string().optional(),
  search: z.string().optional(),
  college_type: z.enum(['government', 'private', 'deemed', 'autonomous']).optional(),
  has_hostel: z.coerce.boolean().optional(),
  has_scholarship: z.coerce.boolean().optional(),
  placement_min: z.coerce.number().min(0).max(100).optional(),
  sort_by: z.enum(['name', 'fee_min', 'placement_rate', 'established_year', 'created_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateCollegeInput = z.infer<typeof createCollegeSchema>
export type UpdateCollegeInput = z.infer<typeof updateCollegeSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type CollegeFilters = z.infer<typeof collegeFiltersSchema>
