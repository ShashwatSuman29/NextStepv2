import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  try {
    const supabase = createServiceClient()

    // Verify DB connectivity with a lightweight query
    const { error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const latencyMs = Date.now() - start

    if (error) {
      return NextResponse.json({
        status: 'degraded',
        db: 'error',
        dbError: error.message,
        latencyMs,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
      }, { status: 503 })
    }

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      userCount: count ?? 0,
      latencyMs,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
      environment: process.env.NODE_ENV,
    })
  } catch (err) {
    const latencyMs = Date.now() - start
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        latencyMs,
        timestamp: new Date().toISOString(),
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
