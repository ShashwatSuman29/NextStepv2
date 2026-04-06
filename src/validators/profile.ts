import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(150),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number too long'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  marks_10th: z.number().min(0).max(100, 'Must be between 0 and 100'),
  marks_12th: z.number().min(0).max(100, '12th marks must be between 0 and 100'),
  appearing_12th: z.boolean().default(false),
  jee_rank: z.number().int().positive('JEE rank must be a positive number').nullable().optional(),
  desired_course: z.string().min(1, 'Desired course is required').max(100),
  desired_branch: z.string().max(100).nullable().optional(),
  stream: z.enum(['UG', 'PG']),
  date_of_birth: z.string().nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  parent_name: z.string().max(150).nullable().optional(),
  parent_phone: z.string().max(15).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  pincode: z.string().max(10).nullable().optional(),
  board_10th: z.string().max(100).nullable().optional(),
  board_12th: z.string().max(100).nullable().optional(),
  mht_cet_score: z.number().min(0).nullable().optional(),
  other_exam_name: z.string().max(100).nullable().optional(),
  other_exam_score: z.number().min(0).nullable().optional(),
  budget_min: z.number().int().min(0).nullable().optional(),
  budget_max: z.number().int().min(0).nullable().optional(),
})

export const profileUpdateSchema = profileSchema.partial()

export type ProfileInput = z.infer<typeof profileSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

/**
 * Determines is_complete based on requirements:
 * All key fields must be filled for a 100% complete profile.
 */
export function computeIsComplete(data: ProfileInput): boolean {
  return (
    !!data.full_name &&
    !!data.phone &&
    data.marks_10th != null &&
    data.marks_12th != null &&
    !!data.desired_course &&
    !!data.stream &&
    !!data.city &&
    !!data.state
  )
}
