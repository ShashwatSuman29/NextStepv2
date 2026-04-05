// ============================================================
// NextStep — TypeScript Types (aligned with DB schema v3.1)
// ============================================================

// -- Roles --
export type UserRole = 'student' | 'admin'

// -- Status types --
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type CollegeStatus = 'active' | 'inactive'
export type BookingType = 'free_call'
export type StreamType = 'UG' | 'PG'
export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'visit_confirmed'
  | 'visit_cancelled'
  | 'visit_completed'
  | 'welcome'
export type NotificationChannel = 'email' | 'in_app'
export type DeliveryStatus = 'pending' | 'sent' | 'failed'

// -- Database row types --
export interface User {
  id: string
  auth_id: string
  email: string
  phone: string | null
  role: UserRole
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  full_name: string
  city: string
  state: string
  marks_10th: number
  marks_12th: number | null
  appearing_12th: boolean
  jee_rank: number | null
  desired_course: string
  desired_branch: string | null
  stream: StreamType
  is_complete: boolean
  phone: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  parent_name: string | null
  parent_phone: string | null
  address: string | null
  pincode: string | null
  board_10th: string | null
  board_12th: string | null
  mht_cet_score: number | null
  other_exam_name: string | null
  other_exam_score: number | null
  budget_min: number | null
  budget_max: number | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  full_name: string
  email: string
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface College {
  id: string
  name: string
  city: string
  state: string
  description: string | null
  fee_min: number | null
  fee_max: number | null
  image_paths: string[]
  daily_visit_capacity: number
  status: CollegeStatus
  is_featured: boolean
  is_deleted: boolean
  created_by: string
  established_year: number | null
  website: string | null
  accreditation: string | null
  ranking: string | null
  campus_size: string | null
  placement_rate: number | null
  avg_package: number | null
  highest_package: number | null
  facilities: string[]
  hostel_available: boolean
  scholarship: boolean
  college_type: 'government' | 'private' | 'deemed' | 'autonomous'
  created_at: string
  updated_at: string
}

export interface CollegeCourse {
  id: string
  college_id: string
  course_name: string
  branch: string | null
  stream: StreamType
  duration_years: number | null
  annual_fee: number | null
  eligibility: string | null
  exams_accepted: string[]
  created_at: string
  updated_at: string
}

export interface CounsellingSlot {
  id: string
  slot_date: string
  slot_time: string
  max_capacity: number
  booked_count: number
  is_available: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface CounsellingBooking {
  id: string
  student_id: string
  slot_id: string
  context_college_id: string | null
  booking_type: BookingType
  preferred_date: string
  preferred_time: string
  status: BookingStatus
  admin_notes: string | null
  cancellation_reason: string | null
  confirmed_by: string | null
  meeting_link: string | null
  created_at: string
  updated_at: string
}

export interface CollegeVisit {
  id: string
  student_id: string
  college_id: string
  visit_date: string
  visit_time: string | null
  status: VisitStatus
  admin_notes: string | null
  cancellation_reason: string | null
  confirmed_by: string | null
  created_at: string
  updated_at: string
}

export interface SavedCollege {
  id: string
  student_id: string
  college_id: string
  saved_at: string
}

export interface Notification {
  id: string
  student_id: string
  type: NotificationType
  channel: NotificationChannel
  message: string
  is_read: boolean
  delivery_status: DeliveryStatus
  retry_count: number
  sent_at: string | null
  reference_id: string | null
  created_at: string
}

// -- API response helpers --
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// -- Auth types --
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  isNewUser: boolean
  isComplete: boolean
}

// -- Valid status transitions --
export const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const VALID_VISIT_TRANSITIONS: Record<VisitStatus, VisitStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
