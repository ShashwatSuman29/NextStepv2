import crypto from 'crypto'
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    if (!['visit', 'counselling'].includes(type)) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 })
    }

    // Verify signature
    const text = razorpay_order_id + "|" + razorpay_payment_id
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex")

    if (!crypto.timingSafeEqual(Buffer.from(generated_signature), Buffer.from(razorpay_signature))) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Verify the order amount from Razorpay API to prevent amount tampering
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: keySecret,
    })
    const order = await instance.orders.fetch(razorpay_order_id)

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Order is not paid' }, { status: 400 })
    }

    // Verify amount matches expected price from platform settings
    const serviceClient = createServiceClient()
    const { data: settings } = await serviceClient.from('platform_settings').select('*').single()
    const expectedAmountInr = type === 'visit' ? (settings?.visit_price_inr ?? 499) : (settings?.counselling_price_inr ?? 199)
    const expectedAmountPaise = expectedAmountInr * 100

    if (order.amount !== expectedAmountPaise) {
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    // Check for duplicate payment (replay attack prevention)
    const { count: existingTxn } = await serviceClient
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('razorpay_payment_id', razorpay_payment_id)

    if ((existingTxn ?? 0) > 0) {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 409 })
    }

    // Payment is valid. Grant credit to user.
    const { data: dbUser } = await supabase.from('users').select('id').eq('auth_id', user.id).single()
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Define which column to top-up based on product type
    const column = type === 'visit' ? 'purchased_visits' : 'purchased_counselling'

    // Atomic increment using RPC or direct SQL-style increment
    const { error: updateError } = await serviceClient.rpc('increment_field', {
      table_name: 'student_profiles',
      field_name: column,
      row_user_id: dbUser.id,
    })

    // Fallback: if RPC doesn't exist, use read-then-write with service client
    if (updateError) {
      const { data: profile } = await serviceClient.from('student_profiles').select(column).eq('user_id', dbUser.id).single()
      const currentVal = (profile as Record<string, number>)?.[column] ?? 0
      await serviceClient
        .from('student_profiles')
        .update({ [column]: currentVal + 1 })
        .eq('user_id', dbUser.id)
    }

    // Insert Transaction
    const { data: trx } = await serviceClient.from('payment_transactions').insert({
      student_id: dbUser.id,
      razorpay_order_id,
      razorpay_payment_id,
      amount_inr: expectedAmountInr,
      item_type: type,
      status: 'success'
    }).select().single()

    // Notify User
    try {
      const { dispatchNotifications } = await import('@/lib/notifications/dispatch')
      await dispatchNotifications(
        dbUser.id,
        'payment_confirmed',
        trx?.id || razorpay_payment_id,
        `Your Premium pass for ${type} was successfully purchased!`
      )
    } catch (e) {
      console.error('Notification dispatch failed', e)
    }

    return NextResponse.json({ success: true, message: 'Payment verified and credit added.' })
  } catch (err: unknown) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
