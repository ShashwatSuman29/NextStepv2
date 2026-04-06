-- Add index on payment_transactions.student_id for faster student-specific queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student_id
  ON public.payment_transactions(student_id);

-- Add index on notifications.student_id + is_read for faster unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_student_unread
  ON public.notifications(student_id, is_read)
  WHERE channel = 'in_app';
