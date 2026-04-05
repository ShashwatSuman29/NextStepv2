import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/auth/verify-admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { error } = await verifyAdmin()
  if (error) return error

  const supabase = createServiceClient()
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1)
  const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '20') || 20), 50)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error: countError } = await supabase
    .from('payment_transactions')
    .select('id, amount_inr, item_type, status, created_at, razorpay_payment_id, student:users(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (countError) {
    console.error('DB error:', countError.message)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }

  return NextResponse.json({ data, meta: { total: count, page, pageSize } })
}
