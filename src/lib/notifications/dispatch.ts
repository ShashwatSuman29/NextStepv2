import { createServiceClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/types'

const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  booking_confirmed: 'Your counselling booking has been confirmed.',
  booking_cancelled: 'Your counselling booking has been cancelled.',
  booking_completed: 'Your counselling session has been completed.',
  visit_confirmed: 'Your college visit has been confirmed.',
  visit_cancelled: 'Your college visit has been cancelled.',
  visit_completed: 'Your college visit has been completed.',
  welcome: 'Welcome to NextStep! Complete your profile to get started.',
}

function buildMessage(type: NotificationType): string {
  return NOTIFICATION_MESSAGES[type] || 'You have a new notification.'
}

/**
 * Dispatch notifications on admin status change.
 * Call from admin PATCH handlers — NOT from booking/visit creation.
 *
 * 1. in_app: ALWAYS synchronous — written before the response returns
 * 2. email: fire-and-forget async via Resend — never blocks the response
 */
export async function dispatchNotifications(
  studentId: string,
  type: NotificationType,
  referenceId: string
) {
  const supabase = createServiceClient()
  const message = buildMessage(type)

  // 1. in_app: synchronous
  await supabase.from('notifications').insert({
    student_id: studentId,
    type,
    channel: 'in_app',
    message,
    delivery_status: 'sent',
    sent_at: new Date().toISOString(),
    reference_id: referenceId,
  })

  // 2. email: fire-and-forget — do NOT await
  sendEmailNotification(studentId, type, message, referenceId).catch((err) =>
    console.error('Email dispatch failed:', err)
  )
}

async function sendEmailNotification(
  studentId: string,
  type: NotificationType,
  message: string,
  referenceId: string
) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping email notification')
    return
  }

  const supabase = createServiceClient()

  // Look up student email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', studentId)
    .single()

  if (!user?.email) return

  // Insert email notification record
  const { data: notifRecord } = await supabase
    .from('notifications')
    .insert({
      student_id: studentId,
      type,
      channel: 'email',
      message,
      delivery_status: 'pending',
      reference_id: referenceId,
    })
    .select('id')
    .single()

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    await resend.emails.send({
      from: 'NextStep <notifications@nextstep.in>',
      to: user.email,
      subject: `NextStep — ${message}`,
      text: message,
    })

    // Mark as sent
    if (notifRecord) {
      await supabase
        .from('notifications')
        .update({ delivery_status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', notifRecord.id)
    }
  } catch (err) {
    // Mark as failed
    if (notifRecord) {
      await supabase
        .from('notifications')
        .update({
          delivery_status: 'failed',
          retry_count: 1,
        })
        .eq('id', notifRecord.id)
    }
    throw err
  }
}
