import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Default rate limiter: 30 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '10 s'),
  analytics: true,
})

// Strict rate limiter for auth endpoints: 6 requests per 60 seconds
const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, '60 s'),
  analytics: true,
  prefix: 'ratelimit:auth',
})

// Strict rate limiter for payment endpoints: 10 requests per 60 seconds
const paymentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:payment',
})

// Very strict for broadcast: 3 requests per 60 seconds
const broadcastRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: true,
  prefix: 'ratelimit:broadcast',
})

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  // Use the first IP from x-forwarded-for (closest to client) to reduce spoofing
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1'

  // ---- Rate Limiting ----
  if (path.startsWith('/api')) {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Pick the appropriate rate limiter based on route
      const isAuthRoute = path.startsWith('/api/auth')
      const isPaymentRoute = path.startsWith('/api/razorpay')
      const isBroadcast = path.startsWith('/api/admin/broadcast')

      const limiter = isAuthRoute ? authRatelimit
        : isPaymentRoute ? paymentRatelimit
        : isBroadcast ? broadcastRatelimit
        : ratelimit

      const { success, limit, reset, remaining } = await limiter.limit(ip)
      if (!success) {
        return addSecurityHeaders(new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }))
      }
    }
  }

  // ---- CSRF Protection: Block cross-origin mutations ----
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && path.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    // Allow requests with no origin (server-to-server, Razorpay webhooks, etc.)
    // but block requests from a different origin (cross-site attacks)
    if (origin && host) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return addSecurityHeaders(
            new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            })
          )
        }
      } catch {
        // Malformed origin header — block it
        return addSecurityHeaders(
          new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      }
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const user = session?.user

  // ---- Unauthenticated users ----
  if ((path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/onboarding')) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ---- Authenticated user on /auth/login → redirect away ----
  if (path.startsWith('/auth/login') && user) {
    const role = user.app_metadata?.role || 'student'

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ---- Admin route protection: verify role from JWT ----
  if (path.startsWith('/admin') && user) {
    const role = user.app_metadata?.role || 'student'

    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // ---- is_complete check for /dashboard/* from JWT ----
  const exempt = ['/dashboard/settings', '/dashboard/saved', '/onboarding']
  if (path.startsWith('/dashboard') && user && !exempt.some((e) => path.startsWith(e))) {
    const isComplete = user.user_metadata?.is_complete === true

    if (!isComplete) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return addSecurityHeaders(supabaseResponse)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/auth/login',
    '/api/:path*',
  ],
}
