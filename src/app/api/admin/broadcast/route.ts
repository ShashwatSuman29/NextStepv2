import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getNotificationEmailHtml } from '@/lib/notifications/template'

export async function POST(request: Request) {
  try {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceClient()

    // Verify admin
    const { data: dbUser } = await serviceClient
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message must be under 5000 characters' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 })
    }

    // Fetch all student emails
    const { data: students, error: studentsError } = await serviceClient
      .from('users')
      .select('email, id')
      .eq('role', 'student')
      .not('email', 'is', null)

    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    if (!students || students.length === 0) {
      return NextResponse.json({ message: 'No students found to send emails to.' })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    const formattedHtml = getNotificationEmailHtml(message)

    // Prepare batch emails
    const emailsToSend = students.map((student) => ({
      from: 'YourNextStep <updates@auth.yournextstep.me>',
      replyTo: 'hello.yournextstep@gmail.com',
      to: student.email,
      subject: 'Special Offer from NextStep 🔔',
      text: message,
      html: formattedHtml,
    }))

    // Send in chunks of 50 to respect rate limits / constraints
    const CHUNK_SIZE = 50
    let sentCount = 0

    for (let i = 0; i < emailsToSend.length; i += CHUNK_SIZE) {
      const chunk = emailsToSend.slice(i, i + CHUNK_SIZE)
      const { error } = await resend.batch.send(chunk)
      if (error) {
        console.error('Batch send error:', error)
      } else {
        sentCount += chunk.length
      }
    }

    return NextResponse.json({ success: true, count: sentCount })
  } catch (error: unknown) {
    console.error('Broadcast error:', error)
    return NextResponse.json({ error: 'Failed to send broadcast' }, { status: 500 })
  }
}
